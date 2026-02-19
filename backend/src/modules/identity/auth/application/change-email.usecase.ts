import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { VerifySecurityCodeUseCase } from './verify-security-code.usecase';
import { SendSecurityCodeUseCase } from './send-security-code.usecase';
import { EmailService } from '../../infra/services/email.service';
import { JwtService } from '@nestjs/jwt';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class ChangeEmailUseCase {
    private readonly logger = new Logger(ChangeEmailUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly sendSecurityCodeUseCase: SendSecurityCodeUseCase,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Step 1: Send verification code to current email
     */
    async requestChange(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new BadRequestException('Tenant not found');

        await this.sendSecurityCodeUseCase.execute((tenant as any).email);

        return { message: 'Verification code sent to your current email' };
    }

    /**
     * Step 2: Verify code from current email, return temp token
     */
    async verifyOldEmail(tenantId: string, code: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new BadRequestException('Tenant not found');

        await this.verifySecurityCodeUseCase.execute((tenant as any).email, code);

        // Generate a short-lived token proving old email verification
        const tempToken = this.jwtService.sign(
            { sub: tenantId, purpose: 'email-change-verified', oldEmail: (tenant as any).email },
            { secret: process.env.JWT_SECRET, expiresIn: '15m' },
        );

        return { tempToken, message: 'Current email verified. Enter your new email.' };
    }

    /**
     * Step 3: Send code to new email
     */
    async sendNewEmailCode(tenantId: string, newEmail: string, tempToken: string) {
        // Verify temp token
        let payload: any;
        try {
            payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
        } catch {
            throw new BadRequestException('Session expired. Please start the email change process again.');
        }

        if (payload.sub !== tenantId || payload.purpose !== 'email-change-verified') {
            throw new BadRequestException('Invalid session token.');
        }

        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new BadRequestException('Tenant not found');

        // Check if new email is already in use
        const existingTenant = await this.prisma.tenant.findUnique({ where: { email: newEmail } });
        if (existingTenant) {
            throw new BadRequestException('This email is already in use by another account.');
        }

        const lang = normalizeLanguage((tenant as any).language);
        await this.sendSecurityCodeUseCase.executeForEmail(newEmail, lang);

        return { message: 'Verification code sent to new email' };
    }

    /**
     * Step 4: Verify code from new email and update
     */
    async confirmNewEmail(tenantId: string, newEmail: string, newEmailCode: string, tempToken: string) {
        // Verify temp token again
        let payload: any;
        try {
            payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
        } catch {
            throw new BadRequestException('Session expired. Please start the email change process again.');
        }

        if (payload.sub !== tenantId || payload.purpose !== 'email-change-verified') {
            throw new BadRequestException('Invalid session token.');
        }

        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new BadRequestException('Tenant not found');

        const oldEmail = (tenant as any).email;

        // Verify new email code
        await this.verifySecurityCodeUseCase.execute(newEmail, newEmailCode);

        // Check uniqueness again
        const existingTenant = await this.prisma.tenant.findUnique({ where: { email: newEmail } });
        if (existingTenant) {
            throw new BadRequestException('This email is already in use.');
        }

        // Update email and invalidate sessions
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                email: newEmail,
                tokenVersion: { increment: 1 },
            } as any,
        });

        const lang = normalizeLanguage((tenant as any).language);

        // Notify both emails
        await this.emailService.sendSecurityNotification(oldEmail, 'emailChangedOld', lang, { newEmail });
        await this.emailService.sendSecurityNotification(newEmail, 'emailChanged', lang, { oldEmail });

        this.logger.log(`[ChangeEmail] Email changed for tenant ${tenantId}: ${oldEmail} -> ${newEmail}`);

        return { success: true, message: 'Email changed successfully', newEmail };
    }
}
