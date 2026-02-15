import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';

@Injectable()
export class ForgotPasswordUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async execute(email: string): Promise<void> {
        // 1. Check if user exists
        const user = await this.prisma.tenant.findUnique({ where: { email } });
        if (!user) {
            // SILENT FAIL: Don't reveal if email exists or not
            return;
        }

        // 2. Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save to DB (15 min expiration)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.verificationCode.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt },
        });

        // 4. Send Email (in user's preferred language from DB)
        const userLanguage = (user as any).language || 'PT';
        await this.emailService.sendPasswordResetEmail(email, code, userLanguage);
    }
}
