import { ConfigService } from '@nestjs/config';
export declare class EfiGatewayProvider {
    private readonly configService;
    private efi;
    constructor(configService: ConfigService);
    private resolveCertificatePath;
    createPixCharge(amount: number): Promise<{
        txid: string;
        pixCode: string;
    }>;
    getPixChargeStatus(txid: string): Promise<string | null>;
    payPixCode(pixCode: string, value?: number): Promise<any>;
    updateConfig(config: any): Promise<any>;
    registerWebhook(pixKey: string, webhookUrl: string): Promise<any>;
    getAccountBalance(): Promise<any>;
}
