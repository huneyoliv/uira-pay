import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { BcryptHasher } from './infra/bcrypt.hasher';
import { JwtTokenProvider } from './infra/jwt.token.provider';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { IPasswordHasher } from './domain/password.hasher.interface';
import { ITokenProvider } from './domain/token.provider.interface';
import { InfraModule } from '../../../infra/infra.module';
import { EmailService } from '../infra/services/email.service';
import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';
import { ForgotPasswordUseCase } from './application/forgot-password.usecase';
import { ResetPasswordUseCase } from './application/reset-password.usecase';
import { LogoutUseCase } from './application/logout.usecase';

@Module({
    imports: [
        InfraModule, // For PrismaService
        PassportModule,
        JwtModule.registerAsync({
            useFactory: () => {
                const secret = process.env.JWT_SECRET;
                if (!secret) {
                    throw new Error('FATAL: JWT_SECRET environment variable is not defined. Application cannot start.');
                }
                return {
                    secret,
                    signOptions: { expiresIn: '1h' },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        RegisterTenantUseCase,
        LoginUseCase,
        JwtStrategy,
        {
            provide: IPasswordHasher,
            useClass: BcryptHasher,
        },
        {
            provide: ITokenProvider,
            useClass: JwtTokenProvider,
        },
        EmailService,
        SendVerificationCodeUseCase,
        VerifyCodeUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        LogoutUseCase,
    ],
    exports: [JwtStrategy, PassportModule],
})
export class AuthModule { }
