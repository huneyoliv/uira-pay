import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Resend } = require('resend');
import { getEmailTemplate } from './email-templates';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private resend: any;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY not configured. Emails will not be sent.');
        }
        this.resend = new Resend(apiKey || 'dummy');
    }

    private getSenderEmail(): string {
        const domain = process.env.DOMAIN || 'swaptune.me';
        return `Uirá Payments <noreply@${domain}>`;
    }

    async sendVerificationEmail(to: string, code: string, language: string = 'PT'): Promise<void> {
        const template = getEmailTemplate('verification', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }

    async sendPasswordResetEmail(to: string, code: string, language: string = 'PT'): Promise<void> {
        const template = getEmailTemplate('passwordReset', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }

    async sendSecurityCodeEmail(to: string, code: string, language: string = 'PT'): Promise<void> {
        const template = getEmailTemplate('securityCode', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }

    async sendSecurityNotification(to: string, type: 'twoFAEnabled' | 'twoFADisabled' | 'passwordChanged' | 'emailChanged' | 'emailChangedOld', language: string = 'PT', extra?: any): Promise<void> {
        const template = getEmailTemplate(type, '', language, extra);
        await this.sendEmail(to, template.subject, template.html);
    }

    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.resend.emails.send({
                from: this.getSenderEmail(),
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            // Don't throw — email failures shouldn't block operations
        }
    }
}
