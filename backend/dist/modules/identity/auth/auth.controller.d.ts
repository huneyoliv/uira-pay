import type { Response } from 'express';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';
import { SendVerificationDto } from './application/dtos/send-verification.dto';
import { VerifyCodeDto } from './application/dtos/verify-code.dto';
import { ResetPasswordDto } from './application/dtos/reset-password.dto';
import { Verify2FADto, Disable2FADto, Reset2FADto, Validate2FADto } from './application/dtos/totp.dto';
import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';
import { ForgotPasswordUseCase } from './application/forgot-password.usecase';
import { ResetPasswordUseCase } from './application/reset-password.usecase';
import { LogoutUseCase } from './application/logout.usecase';
import { Setup2FAUseCase } from './application/totp/setup-2fa.usecase';
import { Verify2FAUseCase } from './application/totp/verify-2fa.usecase';
import { Validate2FAUseCase } from './application/totp/validate-2fa.usecase';
import { Disable2FAUseCase } from './application/totp/disable-2fa.usecase';
import { Reset2FAUseCase } from './application/totp/reset-2fa.usecase';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly registerTenantUseCase;
    private readonly loginUseCase;
    private readonly sendVerificationCodeUseCase;
    private readonly verifyCodeUseCase;
    private readonly forgotPasswordUseCase;
    private readonly resetPasswordUseCase;
    private readonly logoutUseCase;
    private readonly jwtService;
    private readonly setup2FAUseCase;
    private readonly verify2FAUseCase;
    private readonly validate2FAUseCase;
    private readonly disable2FAUseCase;
    private readonly reset2FAUseCase;
    constructor(registerTenantUseCase: RegisterTenantUseCase, loginUseCase: LoginUseCase, sendVerificationCodeUseCase: SendVerificationCodeUseCase, verifyCodeUseCase: VerifyCodeUseCase, forgotPasswordUseCase: ForgotPasswordUseCase, resetPasswordUseCase: ResetPasswordUseCase, logoutUseCase: LogoutUseCase, jwtService: JwtService, setup2FAUseCase: Setup2FAUseCase, verify2FAUseCase: Verify2FAUseCase, validate2FAUseCase: Validate2FAUseCase, disable2FAUseCase: Disable2FAUseCase, reset2FAUseCase: Reset2FAUseCase);
    register(dto: RegisterTenantDto, response: Response): Promise<{
        message: string;
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
    login(dto: LoginDto, response: Response): Promise<{
        message: string;
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
            profilePhotoUrl: any;
            twoFactorEnabled: any;
            isAdmin: any;
        };
    }>;
    sendVerification(dto: SendVerificationDto): Promise<{
        message: string;
    }>;
    verifyCode(dto: VerifyCodeDto): Promise<{
        verificationToken: string;
    }>;
    logout(req: any, response: Response): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    setup2FA(user: any): Promise<{
        secret: string;
        otpAuthUrl: string;
        backupCodes: string[];
    }>;
    verify2FA(user: any, dto: Verify2FADto): Promise<{
        enabled: boolean;
        message: string;
    }>;
    validate2FA(user: any, dto: Validate2FADto): Promise<boolean>;
    disable2FA(user: any, dto: Disable2FADto): Promise<{
        enabled: boolean;
        message: string;
    }>;
    reset2FA(user: any, dto: Reset2FADto): Promise<{
        enabled: boolean;
        message: string;
        remainingBackupCodes: number;
    }>;
}
