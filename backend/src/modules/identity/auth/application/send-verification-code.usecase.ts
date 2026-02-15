import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';

@Injectable()
export class SendVerificationCodeUseCase {
    private readonly logger = new Logger(SendVerificationCodeUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async execute(email: string, language: string = 'PT'): Promise<void> {
        this.logger.log(`[SendVerification] Attempting to send code to: ${email} (lang: ${language})`);

        // Check if email is already registered
        const existingUser = await this.prisma.tenant.findUnique({ where: { email } });
        if (existingUser) {
            this.logger.warn(`[SendVerification] Email already registered: ${email}`);
            throw new ConflictException('Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.');
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
        this.logger.log(`[SendVerification] Code saved to DB for ${email}`);

        // Send Email (localized)
        await this.emailService.sendVerificationEmail(email, code, language);
        this.logger.log(`[SendVerification] Email sent successfully to ${email}`);
    }
}
