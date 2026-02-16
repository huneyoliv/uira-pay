import type { Response } from 'express';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';
import { SendVerificationDto } from './application/dtos/send-verification.dto';
import { VerifyCodeDto } from './application/dtos/verify-code.dto';
import { ResetPasswordDto } from './application/dtos/reset-password.dto';
import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';
import { ForgotPasswordUseCase } from './application/forgot-password.usecase';
import { ResetPasswordUseCase } from './application/reset-password.usecase';
import { LogoutUseCase } from './application/logout.usecase';
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
    constructor(registerTenantUseCase: RegisterTenantUseCase, loginUseCase: LoginUseCase, sendVerificationCodeUseCase: SendVerificationCodeUseCase, verifyCodeUseCase: VerifyCodeUseCase, forgotPasswordUseCase: ForgotPasswordUseCase, resetPasswordUseCase: ResetPasswordUseCase, logoutUseCase: LogoutUseCase, jwtService: JwtService);
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
}
