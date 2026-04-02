import { Injectable, UnauthorizedException, Inject, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';
import { LoginLockoutService } from './login-lockout.service';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenProvider: ITokenProvider,
        private readonly lockoutService: LoginLockoutService,
    ) { }

    async execute(dto: LoginDto) {
        const lockStatus = this.lockoutService.isLocked(dto.email);
        if (lockStatus.locked) {
            const minutes = Math.ceil(lockStatus.remainingMs! / 60000);
            throw new ForbiddenException(`Account temporarily locked. Try again in ${minutes} minutes.`);
        }

        const tenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email } as any,
        });

        if (!tenant) {
            this.lockoutService.recordFailedAttempt(dto.email);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.passwordHasher.compare(dto.password, (tenant as any).password);

        if (!isPasswordValid) {
            const result = this.lockoutService.recordFailedAttempt(dto.email);
            if (result.locked) {
                throw new ForbiddenException('Account temporarily locked due to too many failed attempts. Try again in 15 minutes.');
            }
            throw new UnauthorizedException('Invalid credentials');
        }

        this.lockoutService.recordSuccessfulLogin(dto.email);

        const status = (tenant as any).status;

        if (status === 'REJECTED') {
            throw new UnauthorizedException('Account has been rejected. Contact support.');
        }

        if (status === 'BLOCKED') {
            throw new UnauthorizedException('Account has been blocked. Contact support.');
        }

        const userData = {
            id: tenant.id,
            name: tenant.name,
            email: (tenant as any).email,
            doc_number: tenant.doc_number,
            default_currency: tenant.default_currency,
            preference_locked_until: tenant.preference_locked_until,
            fiatCurrency: (tenant as any).fiatCurrency,
            country: (tenant as any).country,
            language: normalizeLanguage((tenant as any).language),
            theme: (tenant as any).theme || 'system',
            profilePhotoUrl: (tenant as any).profilePhotoUrl || null,
            twoFactorEnabled: (tenant as any).twoFactorEnabled || false,
            isAdmin: (tenant as any).isAdmin || false,
            status: (tenant as any).status || 'PENDING',
            documentRequested: (tenant as any).documentRequested || false,
        };

        // If 2FA is enabled, return a temporary token instead of the full access token
        if ((tenant as any).twoFactorEnabled) {
            const tempToken = this.tokenProvider.sign(
                { sub: tenant.id, email: (tenant as any).email, purpose: '2fa-pending' },
                { expiresIn: '5m' },
            );

            return {
                requires2FA: true,
                tempToken,
                user: userData,
            };
        }

        const accessToken = this.tokenProvider.sign({ sub: tenant.id, email: (tenant as any).email, tokenVersion: (tenant as any).tokenVersion });

        return {
            requires2FA: false,
            accessToken,
            user: userData,
        };
    }
}
