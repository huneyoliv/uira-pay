import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { VerifySecurityCodeUseCase } from './verify-security-code.usecase';
import { EmailService } from '../../infra/services/email.service';
import * as bcrypt from 'bcrypt';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class ChangePasswordUseCase {
    private readonly logger = new Logger(ChangePasswordUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly emailService: EmailService,
    ) { }

    async execute(tenantId: string, currentPassword: string, newPassword: string, emailCode: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, (tenant as any).password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid current password');
        }

        // Verify email code
        await this.verifySecurityCodeUseCase.execute((tenant as any).email, emailCode);

        // Validate new password strength
        if (newPassword.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and increment tokenVersion to invalidate all sessions
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 },
            } as any,
        });

        // Send notification email
        const lang = normalizeLanguage((tenant as any).language);
        await this.emailService.sendSecurityNotification((tenant as any).email, 'passwordChanged', lang);

        this.logger.log(`[ChangePassword] Password changed for tenant ${tenantId}`);

        return { success: true, message: 'Password changed successfully' };
    }
}
