"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTemplate = getEmailTemplate;
const templates = {
    PT: {
        verification: (code) => ({
            subject: 'Seu código de verificação — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Bem-vindo ao Uirá Payments!</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Seu código de verificação é:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira em <strong>15 minutos</strong>. Se você não solicitou isso, ignore este e-mail.</p>
                </div>
            `,
        }),
        passwordReset: (code) => ({
            subject: 'Recuperação de Senha — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Recuperação de Senha</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Você solicitou a redefinição da sua senha.</p>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Seu código de verificação é:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira em <strong>15 minutos</strong>. Se você não solicitou isso, ignore este e-mail.</p>
                </div>
            `,
        }),
    },
    EN: {
        verification: (code) => ({
            subject: 'Your verification code — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Welcome to Uirá Payments!</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Your verification code is:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">This code expires in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
                </div>
            `,
        }),
        passwordReset: (code) => ({
            subject: 'Password Recovery — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Password Recovery</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">You requested a password reset.</p>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Your verification code is:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">This code expires in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
                </div>
            `,
        }),
    },
    FR: {
        verification: (code) => ({
            subject: 'Votre code de vérification — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Bienvenue chez Uirá Payments !</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Votre code de vérification est :</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Ce code expire dans <strong>15 minutes</strong>. Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
                </div>
            `,
        }),
        passwordReset: (code) => ({
            subject: 'Récupération de mot de passe — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Récupération de mot de passe</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Votre code de vérification est :</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Ce code expire dans <strong>15 minutes</strong>. Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
                </div>
            `,
        }),
    },
    ES: {
        verification: (code) => ({
            subject: 'Tu código de verificación — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">¡Bienvenido a Uirá Payments!</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Tu código de verificación es:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste esto, ignora este correo electrónico.</p>
                </div>
            `,
        }),
        passwordReset: (code) => ({
            subject: 'Recuperación de contraseña — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Recuperación de contraseña</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 8px;">Solicitaste restablecer tu contraseña.</p>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Tu código de verificación es:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste esto, ignora este correo electrónico.</p>
                </div>
            `,
        }),
    },
};
function getEmailTemplate(type, code, language = 'PT') {
    const lang = language?.toUpperCase() || 'PT';
    const langTemplates = templates[lang] || templates['PT'];
    return langTemplates[type](code);
}
//# sourceMappingURL=email-templates.js.map