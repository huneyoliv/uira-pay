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
        console.log(`[LoginDebug] Attempting login for email: ${dto.email}`);
        const tenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email } as any,
        });

        if (!tenant) {
            console.log('[LoginDebug] User not found');
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('[LoginDebug] User found. Verifying password...');
        // console.log('[LoginDebug] Stored hash:', (tenant as any).password); // Be careful with logs in prod
        const isPasswordValid = await this.passwordHasher.compare(dto.password, (tenant as any).password);
        console.log(`[LoginDebug] Password valid: ${isPasswordValid}`);

        if (!isPasswordValid) {
            console.log('[LoginDebug] Password mismatch');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if tenant is approved
        const status = (tenant as any).status;
        if (status !== 'APPROVED') {
            console.log(`[LoginDebug] Tenant status is ${status}. Access denied.`);
            throw new UnauthorizedException('Your account is pending approval.');
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
            }
        };
    }
}
