import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class UploadController {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): {
        url: string;
        filename: string;
        signedUrl: string;
    };
    serveFile(filename: string, token: string, expires: string, res: Response): void;
    getSignedUrl(filename: string): {
        signedUrl: string;
        expiresAt: number;
    };
    generateSignedUrl(filename: string): string;
}
