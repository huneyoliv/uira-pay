import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';

@Injectable()
export class LoginUseCase {
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


        // console.log('[LoginDebug] Stored hash:', (tenant as any).password); // Be careful with logs in prod
        const isPasswordValid = await this.passwordHasher.compare(dto.password, (tenant as any).password);


        if (!isPasswordValid) {

            throw new UnauthorizedException('Invalid credentials');
        }

        const status = (tenant as any).status;
        if (status === 'PENDING') {
            throw new UnauthorizedException('Account pending approval by administrator.');
        }
        if (status === 'REJECTED') {
            throw new UnauthorizedException('Account has been rejected. Contact support.');
        }

        const accessToken = this.tokenProvider.sign({ sub: tenant.id, email: (tenant as any).email, tokenVersion: (tenant as any).tokenVersion });

        return {
            accessToken,
            user: {
                id: tenant.id,
                name: tenant.name,
                email: (tenant as any).email,
                doc_number: tenant.doc_number,
                default_currency: tenant.default_currency,
                preference_locked_until: tenant.preference_locked_until,
                fiatCurrency: (tenant as any).fiatCurrency,
                country: (tenant as any).country,
                language: (tenant as any).language || 'PT',
                theme: (tenant as any).theme || 'system',
                profilePhotoUrl: (tenant as any).profilePhotoUrl || null,
                twoFactorEnabled: (tenant as any).twoFactorEnabled || false,
                isAdmin: (tenant as any).isAdmin || false,
            }
        };
    }
}
