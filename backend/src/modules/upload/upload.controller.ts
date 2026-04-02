import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, UseGuards, BadRequestException, Query, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../identity/auth/infra/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename, join } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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
            url: `${baseUrl}/upload/${file.filename}`,
            filename: file.filename,
            signedUrl: this.generateSignedUrl(file.filename),
        };
    }

    @Get(':filename')
    serveFile(
        @Param('filename') filename: string,
        @Query('token') token: string,
        @Query('expires') expires: string,
        @Res() res: Response,
    ) {
        const sanitized = basename(filename);

        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new BadRequestException('Invalid filename');
        }

        const filePath = join('./uploads', sanitized);
        if (!existsSync(filePath)) {
            throw new BadRequestException('File not found');
        }

        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('Server configuration error');
        }
        if (!token || !expires) {
            throw new UnauthorizedException('Missing access token');
        }

        const expiresNum = parseInt(expires, 10);
        if (isNaN(expiresNum) || Date.now() > expiresNum) {
            throw new UnauthorizedException('Access token expired');
        }

        const expectedToken = crypto
            .createHmac('sha256', secret)
            .update(`${sanitized}:${expires}`)
            .digest('hex');

        if (token !== expectedToken) {
            throw new UnauthorizedException('Invalid access token');
        }

        const domain = this.configService.get('DOMAIN');
        const allowedOrigin = domain ? `https://${domain}` : '*';
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.sendFile(sanitized, { root: './uploads' });
    }

    @Get('signed-url/:filename')
    @UseGuards(JwtAuthGuard)
    getSignedUrl(@Param('filename') filename: string) {
        const sanitized = basename(filename);

        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new BadRequestException('Invalid filename');
        }

        const filePath = join('./uploads', sanitized);
        if (!existsSync(filePath)) {
            throw new BadRequestException('File not found');
        }

        const expires = Date.now() + 3600 * 1000;
        return {
            signedUrl: this.generateSignedUrl(sanitized),
            expiresAt: expires,
        };
    }

    generateSignedUrl(filename: string): string {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const domain = this.configService.get('DOMAIN') || 'localhost:8080';
        const expires = Date.now() + 3600 * 1000; // 1 hour

        const token = crypto
            .createHmac('sha256', secret)
            .update(`${filename}:${expires}`)
            .digest('hex');

        const baseUrl = domain.includes('localhost')
            ? `http://${domain}`
            : `https://api.${domain}`;

        return `${baseUrl}/upload/${filename}?token=${token}&expires=${expires}`;
    }
}
