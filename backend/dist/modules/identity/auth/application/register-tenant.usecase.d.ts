import { PrismaService } from '../../../../infra/database/prisma.service';
import { RegisterTenantDto } from './dtos/register-tenant.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';
import { JwtService } from '@nestjs/jwt';
export declare class RegisterTenantUseCase {
    private readonly prisma;
    private readonly passwordHasher;
    private readonly tokenProvider;
    private readonly jwtService;
    constructor(prisma: PrismaService, passwordHasher: IPasswordHasher, tokenProvider: ITokenProvider, jwtService: JwtService);
    execute(dto: RegisterTenantDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: any;
            doc_number: string;
            default_currency: import(".prisma/client").$Enums.Currency | null;
            preference_locked_until: Date;
            fiatCurrency: any;
            country: any;
            language: any;
            theme: any;
            profilePhotoUrl: null;
            twoFactorEnabled: boolean;
            isAdmin: boolean;
        };
    }>;
}
