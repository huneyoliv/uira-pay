type SupportedLanguage = 'PT' | 'EN' | 'FR' | 'ES';

interface EmailTemplate {
    subject: string;
    html: string;
}

type TemplateType = 'verification' | 'passwordReset' | 'securityCode' | 'twoFAEnabled' | 'twoFADisabled' | 'passwordChanged' | 'emailChanged' | 'emailChangedOld';

const templates: Record<SupportedLanguage, Record<TemplateType, (code: string, extra?: any) => EmailTemplate>> = {
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
        securityCode: (code) => ({
            subject: 'Código de Segurança — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Código de Segurança</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Você solicitou um código de segurança para verificar sua identidade:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira em <strong>15 minutos</strong>. Se você não solicitou isso, entre em contato com o suporte imediatamente.</p>
                </div>
            `,
        }),
        twoFAEnabled: () => ({
            subject: 'Autenticação 2FA Ativada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🛡️ 2FA Ativado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">A autenticação de dois fatores foi <strong>ativada</strong> na sua conta Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Se você não realizou esta ação, entre em contato com o suporte imediatamente.</p>
                </div>
            `,
        }),
        twoFADisabled: () => ({
            subject: 'Autenticação 2FA Desativada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ 2FA Desativado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">A autenticação de dois fatores foi <strong>desativada</strong> na sua conta Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Se você não realizou esta ação, entre em contato com o suporte imediatamente.</p>
                </div>
            `,
        }),
        passwordChanged: () => ({
            subject: 'Senha Alterada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🔑 Senha Alterada</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">A senha da sua conta Uirá Payments foi <strong>alterada</strong> com sucesso.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Se você não realizou esta ação, entre em contato com o suporte imediatamente.</p>
                </div>
            `,
        }),
        emailChanged: (_code, extra) => ({
            subject: 'E-mail Alterado — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">📧 E-mail Alterado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Este é o novo endereço de e-mail da sua conta Uirá Payments.</p>
                    ${extra?.oldEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">E-mail anterior: <strong>${extra.oldEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Se você não realizou esta ação, entre em contato com o suporte imediatamente.</p>
                </div>
            `,
        }),
        emailChangedOld: (_code, extra) => ({
            subject: 'Seu e-mail foi alterado — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ E-mail Alterado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">O endereço de e-mail da sua conta Uirá Payments foi alterado.</p>
                    ${extra?.newEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">Novo e-mail: <strong>${extra.newEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Se você não realizou esta ação, entre em contato com o suporte imediatamente.</p>
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
        securityCode: (code) => ({
            subject: 'Security Code — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Security Code</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">You requested a security code to verify your identity:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">This code expires in <strong>15 minutes</strong>. If you did not request this, contact support immediately.</p>
                </div>
            `,
        }),
        twoFAEnabled: () => ({
            subject: '2FA Authentication Enabled — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🛡️ 2FA Enabled</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Two-factor authentication has been <strong>enabled</strong> on your Uirá Payments account.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not perform this action, contact support immediately.</p>
                </div>
            `,
        }),
        twoFADisabled: () => ({
            subject: '2FA Authentication Disabled — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ 2FA Disabled</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Two-factor authentication has been <strong>disabled</strong> on your Uirá Payments account.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not perform this action, contact support immediately.</p>
                </div>
            `,
        }),
        passwordChanged: () => ({
            subject: 'Password Changed — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🔑 Password Changed</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Your Uirá Payments account password has been <strong>changed</strong> successfully.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not perform this action, contact support immediately.</p>
                </div>
            `,
        }),
        emailChanged: (_code, extra) => ({
            subject: 'Email Changed — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">📧 Email Changed</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">This is the new email address for your Uirá Payments account.</p>
                    ${extra?.oldEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">Previous email: <strong>${extra.oldEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not perform this action, contact support immediately.</p>
                </div>
            `,
        }),
        emailChangedOld: (_code, extra) => ({
            subject: 'Your email has been changed — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ Email Changed</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">The email address on your Uirá Payments account has been changed.</p>
                    ${extra?.newEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">New email: <strong>${extra.newEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you did not perform this action, contact support immediately.</p>
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
        securityCode: (code) => ({
            subject: 'Code de Sécurité — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Code de Sécurité</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Vous avez demandé un code de sécurité pour vérifier votre identité :</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Ce code expire dans <strong>15 minutes</strong>. Si vous n'avez pas demandé ceci, contactez le support immédiatement.</p>
                </div>
            `,
        }),
        twoFAEnabled: () => ({
            subject: 'Authentification 2FA Activée — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🛡️ 2FA Activé</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">L'authentification à deux facteurs a été <strong>activée</strong> sur votre compte Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si vous n'avez pas effectué cette action, contactez le support immédiatement.</p>
                </div>
            `,
        }),
        twoFADisabled: () => ({
            subject: 'Authentification 2FA Désactivée — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ 2FA Désactivé</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">L'authentification à deux facteurs a été <strong>désactivée</strong> sur votre compte Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si vous n'avez pas effectué cette action, contactez le support immédiatement.</p>
                </div>
            `,
        }),
        passwordChanged: () => ({
            subject: 'Mot de passe modifié — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🔑 Mot de passe modifié</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Le mot de passe de votre compte Uirá Payments a été <strong>modifié</strong> avec succès.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si vous n'avez pas effectué cette action, contactez le support immédiatement.</p>
                </div>
            `,
        }),
        emailChanged: (_code, extra) => ({
            subject: 'E-mail modifié — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">📧 E-mail modifié</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Voici la nouvelle adresse e-mail de votre compte Uirá Payments.</p>
                    ${extra?.oldEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">E-mail précédent : <strong>${extra.oldEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si vous n'avez pas effectué cette action, contactez le support immédiatement.</p>
                </div>
            `,
        }),
        emailChangedOld: (_code, extra) => ({
            subject: 'Votre e-mail a été modifié — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ E-mail modifié</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">L'adresse e-mail de votre compte Uirá Payments a été modifiée.</p>
                    ${extra?.newEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">Nouvel e-mail : <strong>${extra.newEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si vous n'avez pas effectué cette action, contactez le support immédiatement.</p>
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
        securityCode: (code) => ({
            subject: 'Código de Seguridad — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Código de Seguridad</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 32px;">Solicitaste un código de seguridad para verificar tu identidad:</p>
                    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste esto, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
        twoFAEnabled: () => ({
            subject: 'Autenticación 2FA Activada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🛡️ 2FA Activado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">La autenticación de dos factores ha sido <strong>activada</strong> en tu cuenta Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si no realizaste esta acción, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
        twoFADisabled: () => ({
            subject: 'Autenticación 2FA Desactivada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ 2FA Desactivado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">La autenticación de dos factores ha sido <strong>desactivada</strong> en tu cuenta Uirá Payments.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si no realizaste esta acción, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
        passwordChanged: () => ({
            subject: 'Contraseña Cambiada — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">🔑 Contraseña Cambiada</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">La contraseña de tu cuenta Uirá Payments ha sido <strong>cambiada</strong> con éxito.</p>
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si no realizaste esta acción, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
        emailChanged: (_code, extra) => ({
            subject: 'Correo Electrónico Cambiado — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">📧 Correo Cambiado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">Este es el nuevo correo electrónico de tu cuenta Uirá Payments.</p>
                    ${extra?.oldEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">Correo anterior: <strong>${extra.oldEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si no realizaste esta acción, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
        emailChangedOld: (_code, extra) => ({
            subject: 'Tu correo electrónico fue cambiado — Uirá Payments',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">⚠️ Correo Cambiado</h1>
                    <p style="font-size: 15px; color: #64748b; margin: 0 0 16px;">El correo electrónico de tu cuenta Uirá Payments ha sido cambiado.</p>
                    ${extra?.newEmail ? `<p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px;">Nuevo correo: <strong>${extra.newEmail}</strong></p>` : ''}
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Si no realizaste esta acción, contacta al soporte inmediatamente.</p>
                </div>
            `,
        }),
    },
};

export function getEmailTemplate(
    type: TemplateType,
    code: string,
    language: string = 'PT',
    extra?: any,
): EmailTemplate {
    const lang = (language?.toUpperCase() as SupportedLanguage) || 'PT';
    const langTemplates = templates[lang] || templates['PT'];
    return langTemplates[type](code, extra);
}
