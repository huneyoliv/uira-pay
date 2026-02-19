import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';

@Injectable()
export class VerifySecurityCodeUseCase {
    private readonly logger = new Logger(VerifySecurityCodeUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Verifies a security code and deletes it from DB after use.
     * Also cleans up expired codes.
     */
    async execute(email: string, code: string): Promise<boolean> {
        // Clean up any expired codes first
        await this.prisma.verificationCode.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });

        const record = await this.prisma.verificationCode.findUnique({ where: { email } });

        if (!record) {
            throw new BadRequestException('Verification code not found or expired');
        }

        if (record.expiresAt < new Date()) {
            // Delete expired code
            await this.prisma.verificationCode.delete({ where: { email } });
            throw new BadRequestException('Code expired');
        }

        if (record.code !== code) {
            throw new BadRequestException('Invalid code');
        }

        // Delete code after successful use
        await this.prisma.verificationCode.delete({ where: { email } });
        this.logger.log(`[VerifySecurityCode] Code verified and deleted for ${email}`);

        return true;
    }
}
