import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.resend.com/emails';

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    }

    async sendVerificationEmail(to: string, code: string): Promise<void> {
        if (!this.apiKey) {
            console.error('RESEND_API_KEY is missing');
            return; // Or throw error
        }

        try {
            await axios.post(
                this.apiUrl,
                {
                    from: this.configService.get('DOMAIN')
                        ? `Uirá Payments <onboarding@${this.configService.get('DOMAIN')}>`
                        : 'Uirá Payments <onboarding@resend.dev>',
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
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error: any) {
            console.error('Failed to send email:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(to: string, code: string): Promise<void> {
        if (!this.apiKey) {
            console.error('RESEND_API_KEY is missing');
            return;
        }

        try {
            await axios.post(
                this.apiUrl,
                {
                    from: this.configService.get('DOMAIN')
                        ? `Uirá Payments <security@${this.configService.get('DOMAIN')}>`
                        : 'Uirá Payments <security@resend.dev>',
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
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error: any) {
            console.error('Failed to send password reset email:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to send password reset email');
        }
    }
}
