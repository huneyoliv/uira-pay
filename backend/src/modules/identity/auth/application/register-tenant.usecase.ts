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

        // Generate a unique placeholder for doc_number if not provided
        const tempDocNumber = dto.docNumber || `PENDING-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                doc_number: tempDocNumber,
                email: dto.email,
                password: hashedPassword,
                documentUrl: dto.documentUrl || null,
                country: dto.country || null,
                fiatCurrency: dto.fiatCurrency || null,
                preference_locked_until: new Date(), // Not locked initially
                status: 'PENDING',
                lastTermsAcceptedAt: new Date(),
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

        // Do not return token. Account is pending.
        return {
            message: 'Registration successful. Your account is pending approval by an administrator.',
            user: {
                id: tenant.id,
                name: tenant.name,
                email: (tenant as any).email,
                status: 'PENDING',
            }
        };
    }
}
