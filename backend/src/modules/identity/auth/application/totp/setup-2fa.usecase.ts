import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { TOTP, generateSecret, generateURI } from 'otplib';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class Setup2FAUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async execute(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if ((tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is already enabled. Disable it first to reconfigure.');
        }

        // Generate TOTP secret
        const secret = generateSecret();

        // Generate 8 backup codes
        const rawBackupCodes: string[] = [];
        const hashedBackupCodes: string[] = [];

        for (let i = 0; i < 8; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            rawBackupCodes.push(code);
            hashedBackupCodes.push(await bcrypt.hash(code, 10));
        }

        // Encrypt secret before storage
        const encryptedSecret = this.encryptionService.encrypt(secret);

        // Store the encrypted secret temporarily
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twoFactorSecret: encryptedSecret,
                twoFactorBackupCodes: hashedBackupCodes,
            } as any,
        });

        // Generate OTP Auth URI using the RAW secret (for user scanner)
        const otpAuthUrl = `otpauth://totp/UIR%C3%81%20Payments:${encodeURIComponent((tenant as any).email)}?secret=${secret}&issuer=UIR%C3%81%20Payments&algorithm=SHA1&digits=6&period=30`;

        return {
            secret, // Return raw secret for manual entry
            otpAuthUrl,
            backupCodes: rawBackupCodes,
        };
    }
}
