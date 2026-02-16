import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Reset2FAUseCase {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Resets 2FA using a backup code.
     * After reset, 2FA is disabled and the user must set it up again.
     * The used backup code is consumed (removed from the list).
     */
    async execute(tenantId: string, backupCode: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if (!(tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is not currently enabled.');
        }

        const storedCodes: string[] = (tenant as any).twoFactorBackupCodes || [];

        if (storedCodes.length === 0) {
            throw new BadRequestException('No backup codes available. Please contact support.');
        }

        // SECURITY: Check backup code against all hashed codes
        let matchedIndex = -1;
        for (let i = 0; i < storedCodes.length; i++) {
            const isMatch = await bcrypt.compare(backupCode.toUpperCase(), storedCodes[i]);
            if (isMatch) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex === -1) {
            throw new BadRequestException('Invalid backup code.');
        }

        // Remove the used backup code and disable 2FA
        const remainingCodes = storedCodes.filter((_, i) => i !== matchedIndex);

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: remainingCodes,
            } as any,
        });

        return {
            enabled: false,
            message: '2FA has been reset. Please set up 2FA again for security.',
            remainingBackupCodes: remainingCodes.length,
        };
    }
}
