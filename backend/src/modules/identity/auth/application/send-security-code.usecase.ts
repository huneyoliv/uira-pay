import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class SendSecurityCodeUseCase {
    private readonly logger = new Logger(SendSecurityCodeUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Sends a security verification code to an EXISTING user's email.
     * Used for: enable/disable 2FA, change password, change email, regenerate codes.
     */
    async execute(email: string, language?: string): Promise<void> {
        this.logger.log(`[SecurityCode] Sending code to: ${email}`);

        // Verify user exists
        const tenant = await this.prisma.tenant.findUnique({ where: { email } });
        if (!tenant) {
            throw new BadRequestException('User not found');
        }

        const lang = language || normalizeLanguage((tenant as any).language);

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (upsert) with 15min expiration
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.verificationCode.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt },
        });

        // Send email
        await this.emailService.sendSecurityCodeEmail(email, code, lang);
        this.logger.log(`[SecurityCode] Code sent to ${email}`);
    }

    /**
     * Sends a security code to any email (used for new email verification).
     */
    async executeForEmail(targetEmail: string, language: string = 'PT'): Promise<void> {
        this.logger.log(`[SecurityCode] Sending code to new email: ${targetEmail}`);

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await this.prisma.verificationCode.upsert({
            where: { email: targetEmail },
            update: { code, expiresAt },
            create: { email: targetEmail, code, expiresAt },
        });

        await this.emailService.sendSecurityCodeEmail(targetEmail, code, language);
        this.logger.log(`[SecurityCode] Code sent to ${targetEmail}`);
    }
}
