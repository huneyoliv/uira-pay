import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../identity/auth/infra/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename, join } from 'path';
import { existsSync } from 'fs';
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
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.sendFile(sanitized, { root: './uploads' });
    }
}
