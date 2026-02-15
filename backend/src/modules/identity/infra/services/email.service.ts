import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly apiUrl = 'https://api.resend.com/emails';

    constructor(private readonly configService: ConfigService) { }

    private getApiKey(): string {
        // Try ConfigService first, fallback to process.env (for runtime-injected secrets)
        return this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY || '';
    }

    async sendVerificationEmail(to: string, code: string): Promise<void> {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Attempting to send verification email to: ${to}`);
        this.logger.log(`[Email] API Key present: ${!!apiKey} (length: ${apiKey.length})`);

        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing! Cannot send email.');
            throw new InternalServerErrorException('Email service not configured');
        }

        const domain = this.configService.get('DOMAIN') || process.env.DOMAIN;
        const fromAddress = domain
            ? `Uirá Payments <onboarding@${domain}>`
            : 'Uirá Payments <onboarding@resend.dev>';

        this.logger.log(`[Email] From: ${fromAddress}, Domain: ${domain}`);

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    from: fromAddress,
                    to: [to],
                    subject: 'Seu código de verificação Uirá',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h1>Bem-vindo ao Uirá Payments!</h1>
                            <p>Seu código de verificação é:</p>
                            <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${code}</h2>
                            <p>Este código expira em 15 minutos.</p>
                        </div>
                    `,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            this.logger.log(`[Email] Resend API response: ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            this.logger.error(`[Email] Failed to send email to ${to}:`, error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(to: string, code: string): Promise<void> {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Attempting to send password reset email to: ${to}`);

        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing! Cannot send email.');
            throw new InternalServerErrorException('Email service not configured');
        }

        const domain = this.configService.get('DOMAIN') || process.env.DOMAIN;
        const fromAddress = domain
            ? `Uirá Payments <security@${domain}>`
            : 'Uirá Payments <security@resend.dev>';

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    from: fromAddress,
                    to: [to],
                    subject: 'Recuperação de Senha - Uirá Payments',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h1>Recuperação de Senha</h1>
                            <p>Você solicitou a redefinição da sua senha.</p>
                            <p>Seu código de verificação é:</p>
                            <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${code}</h2>
                            <p>Este código expira em 15 minutos. Se você não solicitou isso, ignore este e-mail.</p>
                        </div>
                    `,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            this.logger.log(`[Email] Password reset email sent: ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            this.logger.error(`[Email] Failed to send password reset email to ${to}:`, error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send password reset email');
        }
    }
}
