import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { IPasswordHasher } from '../domain/password.hasher.interface';

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordHasher: IPasswordHasher,
    ) { }

    async execute(email: string, code: string, newPassword: string): Promise<void> {
        // 1. Find valid verification code
        const record = await this.prisma.verificationCode.findUnique({ where: { email } });

        if (!record) {
            throw new BadRequestException('Invalid or expired code');
        }

        if (record.code !== code) {
            throw new BadRequestException('Invalid code');
        }

        if (record.expiresAt < new Date()) {
            throw new BadRequestException('Code expired');
        }

        // 2. Hash new password
        const hashedPassword = await this.passwordHasher.hash(newPassword);

        // 3. Update User Password & Invalidate All Sessions
        await this.prisma.tenant.update({
            where: { email },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 }, // SECURITY: Revoke all existing sessions after password reset
            },
        });

        // 4. Delete used code
        await this.prisma.verificationCode.delete({ where: { email } });
    }
}
