import type { Response } from 'express';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';
import { SendVerificationDto } from './application/dtos/send-verification.dto';
import { VerifyCodeDto } from './application/dtos/verify-code.dto';
import { ResetPasswordDto } from './application/dtos/reset-password.dto';
import { Verify2FADto, Disable2FADto, Reset2FADto, Validate2FADto, Login2FADto, Login2FARecoveryDto, VerifySecurityCodeDto, RegenerateCodesDto, ChangePasswordDto, ChangeEmailVerifyOldDto, ChangeEmailSendNewCodeDto, ChangeEmailConfirmDto } from './application/dtos/totp.dto';
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
import { RegenerateCodesUseCase } from './application/totp/regenerate-codes.usecase';
import { SendSecurityCodeUseCase } from './application/send-security-code.usecase';
import { VerifySecurityCodeUseCase } from './application/verify-security-code.usecase';
import { ChangePasswordUseCase } from './application/change-password.usecase';
import { ChangeEmailUseCase } from './application/change-email.usecase';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly prisma;
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
    private readonly regenerateCodesUseCase;
    private readonly sendSecurityCodeUseCase;
    private readonly verifySecurityCodeUseCase;
    private readonly changePasswordUseCase;
    private readonly changeEmailUseCase;
    private readonly logger;
    constructor(prisma: PrismaService, registerTenantUseCase: RegisterTenantUseCase, loginUseCase: LoginUseCase, sendVerificationCodeUseCase: SendVerificationCodeUseCase, verifyCodeUseCase: VerifyCodeUseCase, forgotPasswordUseCase: ForgotPasswordUseCase, resetPasswordUseCase: ResetPasswordUseCase, logoutUseCase: LogoutUseCase, jwtService: JwtService, setup2FAUseCase: Setup2FAUseCase, verify2FAUseCase: Verify2FAUseCase, validate2FAUseCase: Validate2FAUseCase, disable2FAUseCase: Disable2FAUseCase, reset2FAUseCase: Reset2FAUseCase, regenerateCodesUseCase: RegenerateCodesUseCase, sendSecurityCodeUseCase: SendSecurityCodeUseCase, verifySecurityCodeUseCase: VerifySecurityCodeUseCase, changePasswordUseCase: ChangePasswordUseCase, changeEmailUseCase: ChangeEmailUseCase);
    register(dto: RegisterTenantDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string | null;
            email: any;
            status: string;
        };
    }>;
    login(dto: LoginDto, response: Response): Promise<{
        message: string;
        requires2FA: boolean;
        tempToken: string | undefined;
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
    } | {
        message: string;
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
        requires2FA?: undefined;
        tempToken?: undefined;
    }>;
    login2FA(dto: Login2FADto, response: Response): Promise<{
        message: string;
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
    }>;
    login2FARecovery(dto: Login2FARecoveryDto, response: Response): Promise<{
        message: string;
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
        twoFactorReset: boolean;
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
    sendSecurityCode(user: any): Promise<{
        message: string;
    }>;
    verifySecurityCode(user: any, dto: VerifySecurityCodeDto): Promise<{
        verified: boolean;
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
    regenerateCodes(user: any, dto: RegenerateCodesDto): Promise<{
        backupCodes: string[];
        message: string;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changeEmailRequest(user: any): Promise<{
        message: string;
    }>;
    changeEmailVerifyOld(user: any, dto: ChangeEmailVerifyOldDto): Promise<{
        tempToken: string;
        message: string;
    }>;
    changeEmailSendNewCode(user: any, dto: ChangeEmailSendNewCodeDto): Promise<{
        message: string;
    }>;
    changeEmailConfirm(user: any, dto: ChangeEmailConfirmDto): Promise<{
        success: boolean;
        message: string;
        newEmail: string;
    }>;
    private verifyTempToken;
    private generateFullAuth;
    private setAuthCookie;
}
