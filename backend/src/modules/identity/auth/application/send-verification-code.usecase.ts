import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';

@Injectable()
export class SendVerificationCodeUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async execute(email: string): Promise<void> {
        // SECURITY: Don't reveal if email already exists (prevents user enumeration)
        // Silently skip if user already registered — the caller always gets the same response
        const existingUser = await this.prisma.tenant.findUnique({ where: { email } });
        if (existingUser) {
            return; // Silent return — don't reveal that email is already registered
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (upsert) with 15min expiration
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.verificationCode.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt },
        });

        // Send Email
        await this.emailService.sendVerificationEmail(email, code);
    }
}
