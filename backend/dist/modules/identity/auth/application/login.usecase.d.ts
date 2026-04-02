import { PrismaService } from '../../../../infra/database/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { IPasswordHasher } from '../domain/password.hasher.interface';
import { ITokenProvider } from '../domain/token.provider.interface';
import { LoginLockoutService } from './login-lockout.service';
export declare class LoginUseCase {
    private readonly prisma;
    private readonly passwordHasher;
    private readonly tokenProvider;
    private readonly lockoutService;
    private readonly logger;
    constructor(prisma: PrismaService, passwordHasher: IPasswordHasher, tokenProvider: ITokenProvider, lockoutService: LoginLockoutService);
    execute(dto: LoginDto): Promise<{
        requires2FA: boolean;
        tempToken: string;
        user: {
            id: string;
            name: string | null;
            email: any;
            doc_number: string;
            default_currency: import(".prisma/client").$Enums.Currency | null;
            preference_locked_until: Date | null;
            fiatCurrency: any;
            country: any;
            language: string;
            theme: any;
            profilePhotoUrl: any;
            twoFactorEnabled: any;
            isAdmin: any;
            status: any;
            documentRequested: any;
        };
        accessToken?: undefined;
    } | {
        requires2FA: boolean;
        accessToken: string;
        user: {
            id: string;
            name: string | null;
            email: any;
            doc_number: string;
            default_currency: import(".prisma/client").$Enums.Currency | null;
            preference_locked_until: Date | null;
            fiatCurrency: any;
            country: any;
            language: string;
            theme: any;
            profilePhotoUrl: any;
            twoFactorEnabled: any;
            isAdmin: any;
            status: any;
            documentRequested: any;
        };
        tempToken?: undefined;
    }>;
}
