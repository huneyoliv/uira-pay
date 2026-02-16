import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { RegisterTenantDto } from './dtos/register-tenant.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegisterTenantUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenProvider: ITokenProvider,
        private readonly jwtService: JwtService,
    ) { }

    async execute(dto: RegisterTenantDto) {
        // 1. Validate email verification token
        try {
            const payload = this.jwtService.verify(dto.verificationToken, {
                secret: process.env.JWT_SECRET,
            });

            if (!payload.verified || payload.email !== dto.email) {
                throw new BadRequestException('Invalid or mismatched verification token');
            }
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException('Invalid or expired verification token');
        }

        // 2. Check if email already exists
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email } as any,
        });

        if (existingTenant) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await this.passwordHasher.hash(dto.password);

        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                doc_number: dto.docNumber,
                email: dto.email,
                password: hashedPassword,
                documentUrl: dto.documentUrl,
                country: dto.country,
                fiatCurrency: dto.fiatCurrency,
                preference_locked_until: new Date(), // Not locked initially
            } as any,
        });

        // Create default wallet
        await this.prisma.wallet.create({
            data: {
                tenant_id: tenant.id,
                currency: 'USDT',
                balance: 0,
            } as any,
        });

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
