import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { verify } from 'otplib';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class Validate2FAUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    /**
     * Validates a TOTP code for an operation (e.g., withdrawal).
     * Returns true if valid, throws if invalid.
     */
    async execute(tenantId: string, code: string): Promise<boolean> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        if (!(tenant as any).twoFactorEnabled) {
            throw new ForbiddenException('2FA is not enabled. Please enable 2FA to proceed.');
        }

        const encryptedSecret = (tenant as any).twoFactorSecret;
        if (!encryptedSecret) {
            throw new BadRequestException('2FA configuration is corrupted. Please reconfigure.');
        }

        // Decrypt secret
        let secret: string;
        try {
            secret = this.encryptionService.decrypt(encryptedSecret);
        } catch (error) {
            throw new BadRequestException('Invalid 2FA configuration (decryption failed).');
        }

        const isValid = verify({ token: code, secret });

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code.');
        }

        return true;
    }
}
