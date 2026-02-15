import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { getEmailTemplate } from './email-templates';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly apiUrl = 'https://api.resend.com/emails';

    constructor(private readonly configService: ConfigService) { }

    private getApiKey(): string {
        return this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY || '';
    }

    private getDomain(): string {
        return this.configService.get('DOMAIN') || process.env.DOMAIN || '';
    }

    async sendVerificationEmail(to: string, code: string, language: string = 'PT'): Promise<void> {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Sending verification email to: ${to} (lang: ${language})`);

        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing!');
            throw new InternalServerErrorException('Email service not configured');
        }

        const domain = this.getDomain();
        const fromAddress = domain
            ? `Uirá Payments <onboarding@${domain}>`
            : 'Uirá Payments <onboarding@resend.dev>';

        const template = getEmailTemplate('verification', code, language);

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    from: fromAddress,
                    to: [to],
                    subject: template.subject,
                    html: template.html,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            this.logger.log(`[Email] Verification email sent (lang: ${language}): ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            this.logger.error(`[Email] Failed to send verification email to ${to}:`, error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(to: string, code: string, language: string = 'PT'): Promise<void> {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Sending password reset email to: ${to} (lang: ${language})`);

        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing!');
            throw new InternalServerErrorException('Email service not configured');
        }

        const domain = this.getDomain();
        const fromAddress = domain
            ? `Uirá Payments <security@${domain}>`
            : 'Uirá Payments <security@resend.dev>';

        const template = getEmailTemplate('passwordReset', code, language);

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    from: fromAddress,
                    to: [to],
                    subject: template.subject,
                    html: template.html,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            this.logger.log(`[Email] Password reset email sent (lang: ${language}): ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            this.logger.error(`[Email] Failed to send password reset email to ${to}:`, error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send password reset email');
        }
    }
}
