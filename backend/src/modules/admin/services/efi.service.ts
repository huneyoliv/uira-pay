import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import * as crypto from 'crypto';

@Injectable()
export class EfiService {
    private readonly logger = new Logger(EfiService.name);
    private accessToken: string | null = null;
    private tokenExpiresAt: number = 0;

    private getCredentials() {
        return {
            clientId: process.env.EFI_CLIENT_ID || '',
            clientSecret: process.env.EFI_CLIENT_SECRET || '',
            certificateBase64: process.env.EFI_CERTIFICATE_BASE64 || '',
            pixKey: process.env.EFI_PIX_KEY || '',
        };
    }

    private getHttpsAgent(): https.Agent | undefined {
        const { certificateBase64 } = this.getCredentials();
        if (!certificateBase64) return undefined;

        const certBuffer = Buffer.from(certificateBase64, 'base64');
        return new https.Agent({
            pfx: certBuffer,
            passphrase: '',
        });
    }

    private async authenticate(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const { clientId, clientSecret } = this.getCredentials();
        if (!clientId || !clientSecret) {
            throw new Error('Efí credentials not configured');
        }

        const agent = this.getHttpsAgent();
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        try {
            const response = await axios.post(
                'https://pix.api.efipay.com.br/oauth/token',
                JSON.stringify({ grant_type: 'client_credentials' }),
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                    httpsAgent: agent,
                },
            );

            this.accessToken = response.data.access_token;
            // Expire 30 seconds early as safety margin
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 30) * 1000;
            return this.accessToken!;
        } catch (error: any) {
            this.logger.error('Failed to authenticate with Efí API', error.response?.data || error.message);
            throw new Error('Efí authentication failed');
        }
    }

    async getBalance(): Promise<{ balance: number; currency: string }> {
        const { clientId } = this.getCredentials();
        if (!clientId) {
            return { balance: 0, currency: 'BRL' };
        }

        try {
            const token = await this.authenticate();
            const agent = this.getHttpsAgent();

            const response = await axios.get(
                'https://pix.api.efipay.com.br/v2/gn/balance',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    httpsAgent: agent,
                },
            );

            this.logger.log(`Efí balance fetched: ${JSON.stringify(response.data)}`);

            return {
                balance: parseFloat(response.data.saldo || '0'),
                currency: 'BRL',
            };
        } catch (error: any) {
            this.logger.error('Failed to fetch Efí balance', error.response?.data || error.message);
            return { balance: 0, currency: 'BRL' };
        }
    }
}
