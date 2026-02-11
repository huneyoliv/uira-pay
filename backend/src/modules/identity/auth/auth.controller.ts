import { Body, Controller, Post, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';

import { SendVerificationCodeUseCase } from './application/send-verification-code.usecase';
import { VerifyCodeUseCase } from './application/verify-code.usecase';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerTenantUseCase: RegisterTenantUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
        private readonly verifyCodeUseCase: VerifyCodeUseCase,
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
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return { message: 'Registered successfully', user: result.user };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.loginUseCase.execute(dto);

        // SECURITY: Store JWT in HttpOnly Cookie
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

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
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return { message: 'Logged out successfully' };
    }
}
