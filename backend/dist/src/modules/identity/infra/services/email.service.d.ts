import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    sendVerificationEmail(to: string, code: string): Promise<void>;
}
