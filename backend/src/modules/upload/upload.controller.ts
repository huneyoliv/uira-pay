import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../identity/auth/infra/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename, join } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class UploadController {
    constructor(private readonly configService: ConfigService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
                return cb(new BadRequestException('Only image and PDF files are allowed!'), false);
            }
            cb(null, true);
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // SECURITY: Validate magic bytes to prevent MIME spoofing
        const buffer = readFileSync(file.path);
        const jpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const pngMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
        const gifMagic = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
        const pdfMagic = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

        if (!jpegMagic && !pngMagic && !gifMagic && !pdfMagic) {
            unlinkSync(file.path);
            throw new BadRequestException('Invalid file content. File does not match allowed formats.');
        }

        const domain = this.configService.get('DOMAIN') || 'localhost:8080';

        const baseUrl = domain.includes('localhost')
            ? `http://${domain}`
            : `https://api.${domain}`;

        return {
            url: `${baseUrl}/uploads/${file.filename}`
        };
    }

    @Get(':filename')
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        // SECURITY: Sanitize filename to prevent path traversal attacks (e.g. ../../etc/passwd)
        const sanitized = basename(filename);

        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new BadRequestException('Invalid filename');
        }

        const filePath = join('./uploads', sanitized);
        if (!existsSync(filePath)) {
            throw new BadRequestException('File not found');
        }

        // Allow cross-origin access for profile photos loaded by the frontend
        const domain = this.configService.get('DOMAIN');
        const allowedOrigin = domain ? `https://${domain}` : '*';
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.sendFile(sanitized, { root: './uploads' });
    }
}
