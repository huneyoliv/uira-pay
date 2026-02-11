import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerifyCodeUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(email: string, code: string): Promise<{ verificationToken: string }> {
        const record = await this.prisma.verificationCode.findUnique({ where: { email } });

        if (!record) {
            throw new BadRequestException('Verification code not found or expired');
        }

        if (record.code !== code) {
            throw new BadRequestException('Invalid code');
        }

        if (record.expiresAt < new Date()) {
            throw new BadRequestException('Code expired');
        }

        // Generate a temporary token to prove email verification
        // This token should be short-lived (e.g., 1 hour) and used in the registration step
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const verificationToken = this.jwtService.sign(
            { email, verified: true },
            { secret, expiresIn: '1h' }
        );

        // Clean up used code
        await this.prisma.verificationCode.delete({ where: { email } });

        return { verificationToken };
    }
}
