import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { VerifySecurityCodeUseCase } from '../verify-security-code.usecase';
import { Validate2FAUseCase } from './validate-2fa.usecase';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegenerateCodesUseCase {
    private readonly logger = new Logger(RegenerateCodesUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly validate2FAUseCase: Validate2FAUseCase,
    ) { }

    /**
     * Regenerate backup codes. Requires 2FA code if enabled, or email code.
     * Old codes are deleted and replaced with new ones.
     * Returns the new codes (only time they can be seen).
     */
    async execute(tenantId: string, totpCode?: string, emailCode?: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if (!(tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is not enabled. Enable 2FA first.');
        }

        // Verify identity: prefer TOTP if provided, else email code
        if (totpCode) {
            await this.validate2FAUseCase.execute(tenantId, totpCode);
        } else if (emailCode) {
            await this.verifySecurityCodeUseCase.execute((tenant as any).email, emailCode);
        } else {
            throw new BadRequestException('Verification required: provide a 2FA code or email verification code.');
        }

        // Generate 8 new backup codes
        const rawBackupCodes: string[] = [];
        const hashedBackupCodes: string[] = [];

        for (let i = 0; i < 8; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            rawBackupCodes.push(code);
            hashedBackupCodes.push(await bcrypt.hash(code, 10));
        }

        // Replace old codes with new ones
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twoFactorBackupCodes: hashedBackupCodes,
            } as any,
        });

        this.logger.log(`[RegenerateCodes] Backup codes regenerated for tenant ${tenantId}`);

        return {
            backupCodes: rawBackupCodes,
            message: 'New recovery codes generated. Save them securely. Old codes have been invalidated.',
        };
    }
}
