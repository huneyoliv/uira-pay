import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/database/prisma.service';
import { verify } from 'otplib';

@Injectable()
export class Verify2FAUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(tenantId: string, code: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        const secret = (tenant as any).twoFactorSecret;
        if (!secret) {
            throw new BadRequestException('2FA has not been set up. Call setup first.');
        }

        if ((tenant as any).twoFactorEnabled) {
            throw new BadRequestException('2FA is already enabled.');
        }

        // Verify the TOTP code
        const isValid = verify({ token: code, secret });

        if (!isValid) {
            throw new BadRequestException('Invalid verification code. Please try again.');
        }

        // Enable 2FA
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { twoFactorEnabled: true } as any,
        });

        return { enabled: true, message: '2FA has been successfully enabled.' };
    }
}
