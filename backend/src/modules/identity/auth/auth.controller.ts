import { Body, Controller, Post, HttpCode, HttpStatus, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
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

import { UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';
import { CurrentUser } from './infra/decorators/current-user.decorator';

import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly registerTenantUseCase: RegisterTenantUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
        private readonly verifyCodeUseCase: VerifyCodeUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly jwtService: JwtService,
        private readonly setup2FAUseCase: Setup2FAUseCase,
        private readonly verify2FAUseCase: Verify2FAUseCase,
        private readonly validate2FAUseCase: Validate2FAUseCase,
        private readonly disable2FAUseCase: Disable2FAUseCase,
        private readonly reset2FAUseCase: Reset2FAUseCase,
    ) { }

    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async register(@Body() dto: RegisterTenantDto) {
        return this.registerTenantUseCase.execute(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.loginUseCase.execute(dto);

        // If 2FA is required, return temp token without setting JWT cookie
        if (result.requires2FA) {
            return {
                message: '2FA verification required',
                requires2FA: true,
                tempToken: result.tempToken,
                user: result.user,
            };
        }

        // SECURITY: Store JWT in HttpOnly Cookie
        const domain = process.env.DOMAIN || undefined;
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return { message: 'Login successful', user: result.user };
    }

    @Post('login/2fa')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login2FA(
        @Body('tempToken') tempToken: string,
        @Body('code') code: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        // Verify the temp token
        let payload: any;
        try {
            payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired session. Please login again.');
        }

        if (!payload || payload.purpose !== '2fa-pending') {
            throw new UnauthorizedException('Invalid session token.');
        }

        // Validate the TOTP code
        await this.validate2FAUseCase.execute(payload.sub, code);

        // Get tenant for full token generation
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: payload.sub },
        });

        if (!tenant) {
            throw new UnauthorizedException('User not found.');
        }

        // Generate full access token
        const accessToken = this.jwtService.sign(
            { sub: tenant.id, email: (tenant as any).email, tokenVersion: (tenant as any).tokenVersion },
            { secret: process.env.JWT_SECRET, expiresIn: '1d' },
        );

        // Set JWT cookie
        const domain = process.env.DOMAIN || undefined;
        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });

        return { message: '2FA verified successfully' };
    }

    @Post('send-verification')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async sendVerification(@Body() dto: SendVerificationDto) {
        await this.sendVerificationCodeUseCase.execute(dto.email, dto.language || 'PT');
        return { message: 'Verification code sent' };
    }

    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verifyCode(@Body() dto: VerifyCodeDto) {
        return this.verifyCodeUseCase.execute(dto.email, dto.code);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: any, @Res({ passthrough: true }) response: Response) {

        try {
            let token = req.cookies['access_token'];
            if (token) {
                try {
                    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
                    if (payload && payload.sub) {
                        await this.logoutUseCase.execute(payload.sub);
                    }
                } catch (tokenError) {
                    // Token invalid or expired — proceed to clear cookies
                }
            }
        } catch (error) {
            console.error('[Logout] Error during logout process:', error);
        }

        const domain = process.env.DOMAIN || undefined;

        response.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
        });

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
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.resetPasswordUseCase.execute(dto.email, dto.code, dto.newPassword);
        return { message: 'Password reset successfully' };
    }

    // ─── 2FA Endpoints ─────────────────────────────────────────────────

    @Post('2fa/setup')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async setup2FA(@CurrentUser() user: any) {
        return this.setup2FAUseCase.execute(user.id);
    }

    @Post('2fa/verify')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verify2FA(@CurrentUser() user: any, @Body() dto: Verify2FADto) {
        return this.verify2FAUseCase.execute(user.id, dto.code);
    }

    @Post('2fa/validate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async validate2FA(@CurrentUser() user: any, @Body() dto: Validate2FADto) {
        return this.validate2FAUseCase.execute(user.id, dto.code);
    }

    @Post('2fa/disable')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async disable2FA(@CurrentUser() user: any, @Body() dto: Disable2FADto) {
        return this.disable2FAUseCase.execute(user.id, dto.password, dto.code);
    }

    @Post('2fa/reset')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async reset2FA(@CurrentUser() user: any, @Body() dto: Reset2FADto) {
        return this.reset2FAUseCase.execute(user.id, dto.backupCode);
    }
}
