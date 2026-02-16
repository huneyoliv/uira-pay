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

// 2FA Use Cases
import { Setup2FAUseCase } from './application/totp/setup-2fa.usecase';
import { Verify2FAUseCase } from './application/totp/verify-2fa.usecase';
import { Validate2FAUseCase } from './application/totp/validate-2fa.usecase';
import { Disable2FAUseCase } from './application/totp/disable-2fa.usecase';
import { Reset2FAUseCase } from './application/totp/reset-2fa.usecase';
import { EncryptionService } from './application/encryption.service';

@Module({
    imports: [
        InfraModule,
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
        // 2FA
        Setup2FAUseCase,
        Verify2FAUseCase,
        Validate2FAUseCase,
        Disable2FAUseCase,
        Reset2FAUseCase,
        EncryptionService,
    ],
    exports: [JwtStrategy, PassportModule, Validate2FAUseCase],
})
export class AuthModule { }
