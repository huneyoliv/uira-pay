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
        message: string;
        user: {
            id: string;
            name: string | null;
            email: any;
            status: string;
        };
    }>;
}
