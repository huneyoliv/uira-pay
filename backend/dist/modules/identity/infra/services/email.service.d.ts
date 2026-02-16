import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    private getApiKey;
    private getDomain;
    sendVerificationEmail(to: string, code: string, language?: string): Promise<void>;
    sendPasswordResetEmail(to: string, code: string, language?: string): Promise<void>;
}
