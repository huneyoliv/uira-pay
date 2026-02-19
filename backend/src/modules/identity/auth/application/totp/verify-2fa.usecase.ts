import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { EncryptionService } from '../encryption.service';
import { VerifySecurityCodeUseCase } from '../verify-security-code.usecase';
import { EmailService } from '../../../infra/services/email.service';
import { verifySync } from 'otplib';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class Verify2FAUseCase {
    private readonly logger = new Logger(Verify2FAUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Verifies the TOTP code during 2FA setup AND requires email verification code.
     * Once both are valid, 2FA is enabled and a notification email is sent.
     */
    async execute(tenantId: string, totpCode: string, emailCode: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if ((tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is already enabled.');
        }

        const encryptedSecret = (tenant as any).twoFactorSecret;
        if (!encryptedSecret) {
            throw new BadRequestException('2FA setup has not been initiated. Please start setup first.');
        }

        // Verify email code first
        await this.verifySecurityCodeUseCase.execute((tenant as any).email, emailCode);

        // Decrypt and verify TOTP code
        const secret = this.encryptionService.decrypt(encryptedSecret);
        const result = verifySync({ token: totpCode, secret });

        if (!result.valid) {
            throw new BadRequestException('Invalid verification code.');
        }

        // Enable 2FA
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { twoFactorEnabled: true } as any,
        });

        // Send notification email
        const lang = normalizeLanguage((tenant as any).language);
        await this.emailService.sendSecurityNotification((tenant as any).email, 'twoFAEnabled', lang);

        this.logger.log(`[Verify2FA] 2FA enabled for tenant ${tenantId}`);

        return { enabled: true, message: '2FA enabled successfully' };
    }
}
