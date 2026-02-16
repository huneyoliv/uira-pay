import { PrismaService } from '../../../../infra/database/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';
export declare class LoginUseCase {
    private readonly prisma;
    private readonly passwordHasher;
    private readonly tokenProvider;
    constructor(prisma: PrismaService, passwordHasher: IPasswordHasher, tokenProvider: ITokenProvider);
    execute(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: any;
            doc_number: string;
            default_currency: import(".prisma/client").$Enums.Currency | null;
            preference_locked_until: Date | null;
            fiatCurrency: any;
            country: any;
            language: any;
            theme: any;
            profilePhotoUrl: any;
            twoFactorEnabled: any;
            isAdmin: any;
        };
    }>;
}
