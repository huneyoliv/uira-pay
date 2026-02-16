import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

type AdminEmailType = 'accountBlocked' | 'accountUnblocked' | 'documentRequest' | 'newTerms';

const adminEmailTemplates: Record<string, Record<AdminEmailType, (data: any) => { subject: string; html: string }>> = {
    PT: {
        accountBlocked: (data) => ({
            subject: 'Sua conta foi suspensa — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 16px;">Conta Suspensa</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Sua conta no Uirá Payments foi suspensa por um administrador.</p>
                    ${data.reason ? `<p style="font-size: 15px; color: #334155; margin: 0 0 16px;"><strong>Motivo:</strong> ${data.reason}</p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Entre em contato com o suporte para mais informações.</p>
                </div>
            `,
        }),
        accountUnblocked: () => ({
            subject: 'Sua conta foi reativada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0 0 16px;">Conta Reativada</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Sua conta no Uirá Payments foi reativada. Você pode acessar normalmente.</p>
                </div>
            `,
        }),
        documentRequest: (data) => ({
            subject: 'Documentos solicitados — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #d97706; margin: 0 0 16px;">Documentos Solicitados</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Um administrador solicitou que você envie documentos.</p>
                    ${data.message ? `<div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style="font-size: 14px; color: #334155; margin: 0;">${data.message}</p></div>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Acesse sua conta para enviar os documentos solicitados.</p>
                </div>
            `,
        }),
        newTerms: (data) => ({
            subject: 'Novos Termos de Uso — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Atualização nos Termos</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Os termos de uso do Uirá Payments foram atualizados. As novas condições entrarão em vigor em <strong>${data.effectiveDate}</strong>.</p>
                    <p style="font-size: 13px; color: #94a3b8;">Acesse sua conta para revisar e aceitar os novos termos.</p>
                </div>
            `,
        }),
    },
    EN: {
        accountBlocked: (data) => ({
            subject: 'Your account has been suspended — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 16px;">Account Suspended</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Your Uirá Payments account has been suspended by an administrator.</p>
                    ${data.reason ? `<p style="font-size: 15px; color: #334155; margin: 0 0 16px;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Please contact support for more information.</p>
                </div>
            `,
        }),
        accountUnblocked: () => ({
            subject: 'Your account has been reactivated — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0 0 16px;">Account Reactivated</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Your Uirá Payments account has been reactivated. You can access it normally.</p>
                </div>
            `,
        }),
        documentRequest: (data) => ({
            subject: 'Documents requested — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #d97706; margin: 0 0 16px;">Documents Requested</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">An administrator has requested that you submit documents.</p>
                    ${data.message ? `<div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style="font-size: 14px; color: #334155; margin: 0;">${data.message}</p></div>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Log in to your account to upload the requested documents.</p>
                </div>
            `,
        }),
        newTerms: (data) => ({
            subject: 'Updated Terms of Service — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Terms Update</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">The Uirá Payments terms of service have been updated. The new terms will take effect on <strong>${data.effectiveDate}</strong>.</p>
                    <p style="font-size: 13px; color: #94a3b8;">Please log in to review and accept the new terms.</p>
                </div>
            `,
        }),
    },
    ES: {
        accountBlocked: (data) => ({
            subject: 'Su cuenta ha sido suspendida — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 16px;">Cuenta Suspendida</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Su cuenta de Uirá Payments ha sido suspendida por un administrador.</p>
                    ${data.reason ? `<p style="font-size: 15px; color: #334155; margin: 0 0 16px;"><strong>Motivo:</strong> ${data.reason}</p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Póngase en contacto con el soporte para más información.</p>
                </div>
            `,
        }),
        accountUnblocked: () => ({
            subject: 'Su cuenta ha sido reactivada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0 0 16px;">Cuenta Reactivada</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Su cuenta de Uirá Payments ha sido reactivada. Puede acceder normalmente.</p>
                </div>
            `,
        }),
        documentRequest: (data) => ({
            subject: 'Documentos solicitados — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #d97706; margin: 0 0 16px;">Documentos Solicitados</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Un administrador ha solicitado que envíe documentos.</p>
                    ${data.message ? `<div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style="font-size: 14px; color: #334155; margin: 0;">${data.message}</p></div>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Inicie sesión en su cuenta para subir los documentos solicitados.</p>
                </div>
            `,
        }),
        newTerms: (data) => ({
            subject: 'Nuevos Términos de Uso — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Actualización de Términos</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Los términos de uso de Uirá Payments han sido actualizados. Las nuevas condiciones entrarán en vigor el <strong>${data.effectiveDate}</strong>.</p>
                    <p style="font-size: 13px; color: #94a3b8;">Inicie sesión para revisar y aceptar los nuevos términos.</p>
                </div>
            `,
        }),
    },
    FR: {
        accountBlocked: (data) => ({
            subject: 'Votre compte a été suspendu — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 16px;">Compte Suspendu</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Votre compte Uirá Payments a été suspendu par un administrateur.</p>
                    ${data.reason ? `<p style="font-size: 15px; color: #334155; margin: 0 0 16px;"><strong>Raison :</strong> ${data.reason}</p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Veuillez contacter le support pour plus d'informations.</p>
                </div>
            `,
        }),
        accountUnblocked: () => ({
            subject: 'Votre compte a été réactivé — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0 0 16px;">Compte Réactivé</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Votre compte Uirá Payments a été réactivé. Vous pouvez y accéder normalement.</p>
                </div>
            `,
        }),
        documentRequest: (data) => ({
            subject: 'Documents demandés — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #d97706; margin: 0 0 16px;">Documents Demandés</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Un administrateur a demandé que vous soumettiez des documents.</p>
                    ${data.message ? `<div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style="font-size: 14px; color: #334155; margin: 0;">${data.message}</p></div>` : ''}
                    <p style="font-size: 13px; color: #94a3b8;">Connectez-vous à votre compte pour télécharger les documents demandés.</p>
                </div>
            `,
        }),
        newTerms: (data) => ({
            subject: 'Nouvelles Conditions d\'Utilisation — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Mise à Jour des Conditions</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Les conditions d'utilisation de Uirá Payments ont été mises à jour. Les nouvelles conditions entreront en vigueur le <strong>${data.effectiveDate}</strong>.</p>
                    <p style="font-size: 13px; color: #94a3b8;">Connectez-vous pour examiner et accepter les nouvelles conditions.</p>
                </div>
            `,
        }),
    },
};

@Injectable()
export class AdminEmailService {
    private readonly logger = new Logger(AdminEmailService.name);
    private readonly apiUrl = 'https://api.resend.com/emails';

    private getApiKey(): string {
        return process.env.RESEND_API_KEY || '';
    }

    private getDomain(): string {
        return process.env.DOMAIN || '';
    }

    async sendAdminEmail(to: string, type: AdminEmailType, language: string = 'PT', data: any = {}): Promise<void> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            this.logger.warn('[AdminEmail] RESEND_API_KEY missing, skipping email');
            return;
        }

        const lang = language?.toUpperCase() || 'PT';
        const templates = adminEmailTemplates[lang] || adminEmailTemplates['EN'];
        const template = templates[type](data);

        const domain = this.getDomain();
        const fromAddress = domain
            ? `Uirá Payments <admin@${domain}>`
            : 'Uirá Payments <admin@resend.dev>';

        try {
            await axios.post(
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
                },
            );
            this.logger.log(`[AdminEmail] ${type} email sent to ${to} (lang: ${lang})`);
        } catch (error: any) {
            this.logger.error(`[AdminEmail] Failed to send ${type} email to ${to}`, error.response?.data || error.message);
        }
    }

    async sendBulkEmail(recipients: Array<{ email: string; language: string }>, type: AdminEmailType, data: any = {}): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const recipient of recipients) {
            try {
                await this.sendAdminEmail(recipient.email, type, recipient.language, data);
                sent++;
                // Rate limiting: small delay between emails
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch {
                failed++;
            }
        }

        this.logger.log(`[AdminEmail] Bulk ${type}: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    }
}
