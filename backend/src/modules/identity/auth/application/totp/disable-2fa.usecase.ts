import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { verifySync } from 'otplib';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class Disable2FAUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async execute(tenantId: string, password: string, code: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if (!(tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is not currently enabled.');
        }

        // SECURITY: Require password re-authentication
        const isPasswordValid = await bcrypt.compare(password, (tenant as any).password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password.');
        }

        // SECURITY: Require valid TOTP code
        const encryptedSecret = (tenant as any).twoFactorSecret;
        if (!encryptedSecret) {
            // Fallback or error state
            throw new BadRequestException('2FA state corrupted.');
        }

        // Decrypt secret
        let secret: string;
        try {
            secret = this.encryptionService.decrypt(encryptedSecret);
        } catch (error) {
            throw new BadRequestException('Decryption failed.');
        }

        const result = verifySync({ token: code, secret });

        if (!result.valid) {
            throw new BadRequestException('Invalid 2FA code.');
        }

        // Disable 2FA and clear secrets
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: [],
            } as any,
        });

        return { enabled: false, message: '2FA has been successfully disabled.' };
    }
}
