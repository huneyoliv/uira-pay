import { Body, Controller, Post, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';

import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';

import { ForgotPasswordUseCase } from './application/forgot-password.usecase';
import { ResetPasswordUseCase } from './application/reset-password.usecase';
import { LogoutUseCase } from './application/logout.usecase';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';

import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerTenantUseCase: RegisterTenantUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
        private readonly verifyCodeUseCase: VerifyCodeUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly jwtService: JwtService,
    ) { }

    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async register(@Body() dto: RegisterTenantDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.registerTenantUseCase.execute(dto);

        // SECURITY: Store JWT in HttpOnly Cookie
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return { message: 'Registered successfully', user: result.user };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.loginUseCase.execute(dto);

        console.log('[LoginDebug] Controller: Case executed. Signing token...');
        // SECURITY: Store JWT in HttpOnly Cookie
        // Using SameSite: None + Secure to ensure cross-subdomain/cross-site delivery works
        const domain = process.env.DOMAIN || undefined; // e.g., 'swaptune.me'
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: true, // Always true for SameSite=None
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined, // Allow subdomains
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        console.log(`[LoginDebug] Controller: Cookie set with domain: ${domain ? '.' + domain : 'HostOnly'}, SameSite: None. Returning response 200.`);
        return { message: 'Login successful', user: result.user };
    }

    @Post('send-verification')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async sendVerification(@Body('email') email: string) {
        await this.sendVerificationCodeUseCase.execute(email);
        return { message: 'Verification code sent' };
    }

    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verifyCode(@Body() body: { email: string; code: string }) {
        return this.verifyCodeUseCase.execute(body.email, body.code);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: any, @Res({ passthrough: true }) response: Response) {

        try {
            // Manually extract and verify token to perform revocation (if valid)
            let token = req.cookies['access_token'];
            if (token) {
                try {
                    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
                    if (payload && payload.sub) {
                        await this.logoutUseCase.execute(payload.sub);
                        console.log(`[Logout] Token revoked for user ${payload.sub}`);
                    }
                } catch (tokenError) {
                    console.warn('[Logout] Token invalid or expired. Proceeding to clear cookies.', tokenError.message);
                }
            }
        } catch (error) {
            console.error('[Logout] Error during logout process:', error);
        }

        const domain = process.env.DOMAIN || undefined;

        // Clear the cookie with the EXACT same options it was set with
        response.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
        });

        // Also clear without domain (HostOnly) in case it was set that way
        response.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });

        return { message: 'Logged out successfully' };
    }

    @Post('forgot-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async forgotPassword(@Body('email') email: string) {
        await this.forgotPasswordUseCase.execute(email);
        return { message: 'If the email exists, a recovery code has been sent.' };
    }

    @Post('reset-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async resetPassword(@Body() body: any) {
        await this.resetPasswordUseCase.execute(body.email, body.code, body.newPassword);
        return { message: 'Password reset successfully' };
    }
}
