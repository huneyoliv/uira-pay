import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// @ts-ignore
import EfiPay from 'gn-api-sdk-typescript';

@Injectable()
export class EfiGatewayProvider {
    private efi: any;

    constructor(private readonly configService: ConfigService) {
        const certificatePath = this.resolveCertificatePath();

        const efiSandbox = this.configService.get<string>('EFI_SANDBOX');
        const isSandbox = efiSandbox !== undefined
            ? efiSandbox === 'true'
            : process.env.NODE_ENV !== 'production';

        const options = {
            sandbox: isSandbox,
            client_id: this.configService.get<string>('EFI_CLIENT_ID') || '',
            client_secret: this.configService.get<string>('EFI_CLIENT_SECRET') || '',
            certificate: certificatePath,
        };

        console.log(`Efí SDK initialized in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);

        if (!options.certificate) {
            console.error('CRITICAL: Efí Certificate path could not be resolved.');
        }

        this.efi = new EfiPay(options);
    }

    /**
     * Resolves the certificate path from environment variables.
     * Priority: EFI_CERTIFICATE_BASE64 (decoded to temp file) > EFI_CERTIFICATE_PATH (file path)
     */
    private resolveCertificatePath(): string {
        // 1. Try base64 encoded certificate (for secret managers that don't support binary files)
        const certBase64 = this.configService.get<string>('EFI_CERTIFICATE_BASE64');
        if (certBase64) {
            const tempCertPath = path.join(os.tmpdir(), 'efi-cert.p12');
            const certBuffer = Buffer.from(certBase64, 'base64');
            fs.writeFileSync(tempCertPath, certBuffer);
            return tempCertPath;
        }

        // 2. Fallback: direct file path
        const certPath = this.configService.get<string>('EFI_CERTIFICATE_PATH');
        if (!certPath) {
            throw new Error('FATAL: Neither EFI_CERTIFICATE_BASE64 nor EFI_CERTIFICATE_PATH is configured.');
        }

        return path.isAbsolute(certPath)
            ? certPath
            : path.resolve(process.cwd(), certPath);
    }

    async createPixCharge(amount: number): Promise<{ txid: string; pixCode: string }> {
        try {
            const body = {
                calendario: {
                    expiracao: 3600,
                },
                valor: {
                    original: amount.toFixed(2),
                },
                chave: 'CHAVE_PIX_AQUI', // Ideally from config or tenant, using a default for now or needs to be passed
                solicitacaoPagador: 'Cobrança UIRÁ Payments',
            };

            // 1. Create Charge
            // Note: In real scenario we need a valid Pix Key. For now assuming we use a static one or generate dynamic.
            // Actually, 'pixCreateImmediateCharge' doesn't strictly require 'chave' if using static QR, but for dynamic it does.
            // Let's assume we need to configure a key.

            // Wait, for dynamic QR code (cob), we don't pass the key in the body usually if it's associated with the account credentials?
            // Checking docs: "chave" is required.
            // Let's add EFI_PIX_KEY to env.

            const pixKey = this.configService.get<string>('EFI_PIX_KEY');
            if (!pixKey) {
                throw new InternalServerErrorException('EFI_PIX_KEY not configured');
            }
            body.chave = pixKey;

            const charge = await this.efi.pixCreateImmediateCharge({}, body);
            const txid = charge.txid;

            // 2. Get QR Code
            const qrCode = await this.efi.pixGenerateQRCode({ id: charge.loc.id });

            return {
                txid: txid,
                pixCode: qrCode.qrcode,
            };
        } catch (error: any) {
            console.error('Error creating Pix charge:', error);
            throw new InternalServerErrorException('Failed to create Pix charge');
        }
    }

    async getPixChargeStatus(txid: string): Promise<string | null> {
        try {
            const response = await this.efi.pixDetailCharge({ txid: txid });
            return response.status;
        } catch (error: any) {
            if (error?.nome === 'cobranca_nao_encontrada' || error?.message === 'cobranca_nao_encontrada') {
                return null;
            }
            console.error(`Error fetching Pix charge status for ${txid}:`, error);
            throw new InternalServerErrorException('Failed to fetch Pix charge status');
        }
    }

    async payPixCode(pixCode: string, value?: number): Promise<any> {
        try {
            // 1. Pay Pix via "Pix Copia e Cola" (BR Code)
            // The endpoint usually is 'pixPagamento' or similar.
            // Based on common SDK usage for paying a BR Code:

            const body: any = {
                pix: pixCode
            };

            // If value is provided (for QR Codes without value), we might need to pass it.
            // But usually the BR Code has it or we override.
            // Checking docs (assumed): 'pixPagamento' takes body with 'pix' (the code).

            // Note: This requires the account to have balance and permissions.
            const response = await this.efi.pixPagamento({}, body);
            return response;
        } catch (error: any) {
            console.error('Error paying Pix Code:', error);
            throw new InternalServerErrorException(`Failed to pay Pix Code: ${error.message}`);
        }
    }
    async updateConfig(config: any): Promise<any> {
        try {
            const response = await this.efi.updateAccountConfig({}, config);
            return response;
        } catch (error: any) {
            console.error('Error updating Efí config:', error);
            throw new InternalServerErrorException(`Failed to update Efí config: ${error.message}`);
        }
    }
    async registerWebhook(pixKey: string, webhookUrl: string): Promise<any> {
        try {
            const params = {
                chave: pixKey,
            };
            const body = {
                webhookUrl: webhookUrl,
            };
            const response = await this.efi.pixConfigWebhook(params, body);
            return response;
        } catch (error: any) {
            console.error('Error registering Efí webhook:', error);
            throw new InternalServerErrorException(`Failed to register Efí webhook: ${error.message}`);
        }
    }
    async getAccountBalance(): Promise<any> {
        try {
            const response = await this.efi.getAccountBalance();
            return response;
        } catch (error: any) {
            console.error('Error fetching account balance:', error);
            throw error;
        }
    }
}
