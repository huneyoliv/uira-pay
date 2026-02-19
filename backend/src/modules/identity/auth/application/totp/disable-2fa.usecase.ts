import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { EncryptionService } from '../encryption.service';
import { VerifySecurityCodeUseCase } from '../verify-security-code.usecase';
import { EmailService } from '../../../infra/services/email.service';
import * as bcrypt from 'bcrypt';
import { verifySync } from 'otplib';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class Disable2FAUseCase {
    private readonly logger = new Logger(Disable2FAUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Disables 2FA. Requires: password + TOTP code + email verification code.
     * Triple verification for maximum security.
     */
    async execute(tenantId: string, password: string, totpCode: string, emailCode: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if (!(tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is not currently enabled.');
        }

        // 1. Verify password
        const isPasswordValid = await bcrypt.compare(password, (tenant as any).password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password.');
        }

        // 2. Verify TOTP code
        const encryptedSecret = (tenant as any).twoFactorSecret;
        if (!encryptedSecret) {
            throw new BadRequestException('2FA secret not found.');
        }

        const secret = this.encryptionService.decrypt(encryptedSecret);
        const result = verifySync({ token: totpCode, secret });

        if (!result.valid) {
            throw new BadRequestException('Invalid 2FA code.');
        }

        // 3. Verify email code
        await this.verifySecurityCodeUseCase.execute((tenant as any).email, emailCode);

        // Disable 2FA and clear all related data
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: [],
            } as any,
        });

        // Send notification email
        const lang = normalizeLanguage((tenant as any).language);
        await this.emailService.sendSecurityNotification((tenant as any).email, 'twoFADisabled', lang);

        this.logger.log(`[Disable2FA] 2FA disabled for tenant ${tenantId}`);

        return { enabled: false, message: '2FA disabled successfully' };
    }
}
