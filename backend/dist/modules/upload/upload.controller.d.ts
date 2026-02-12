import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class UploadController {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): {
        url: string;
    };
    serveFile(filename: string, res: Response): void;
}
