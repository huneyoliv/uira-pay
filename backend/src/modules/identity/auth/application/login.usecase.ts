import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';

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
    ) { }

    async execute(dto: LoginDto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email } as any,
        });

        if (!tenant) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.passwordHasher.compare(dto.password, (tenant as any).password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

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
