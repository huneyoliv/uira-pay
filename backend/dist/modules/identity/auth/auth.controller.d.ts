import type { Response } from 'express';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';
import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';
export declare class AuthController {
    private readonly registerTenantUseCase;
    private readonly loginUseCase;
    private readonly sendVerificationCodeUseCase;
    private readonly verifyCodeUseCase;
    constructor(registerTenantUseCase: RegisterTenantUseCase, loginUseCase: LoginUseCase, sendVerificationCodeUseCase: SendVerificationCodeUseCase, verifyCodeUseCase: VerifyCodeUseCase);
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
    sendVerification(email: string): Promise<{
        message: string;
    }>;
    verifyCode(body: {
        email: string;
        code: string;
    }): Promise<{
        verificationToken: string;
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
}
