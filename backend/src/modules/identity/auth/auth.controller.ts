import { Body, Controller, Post, HttpCode, HttpStatus, Res, UnauthorizedException, UseGuards, Req, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { RegisterTenantUseCase } from './application/register-tenant.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RegisterTenantDto } from './application/dtos/register-tenant.dto';
import { LoginDto } from './application/dtos/login.dto';
import { SendVerificationDto } from './application/dtos/send-verification.dto';
import { VerifyCodeDto } from './application/dtos/verify-code.dto';
import { ResetPasswordDto } from './application/dtos/reset-password.dto';
import {
    Verify2FADto, Disable2FADto, Reset2FADto, Validate2FADto,
    Login2FADto, Login2FARecoveryDto,
    SendSecurityCodeDto, VerifySecurityCodeDto,
    RegenerateCodesDto,
    ChangePasswordDto,
    ChangeEmailVerifyOldDto, ChangeEmailSendNewCodeDto, ChangeEmailConfirmDto,
} from './application/dtos/totp.dto';

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
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';
import { CurrentUser } from './infra/decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';

function normalizeLanguage(lang: string | null | undefined): string {
    if (!lang) return 'PT';
    const map: Record<string, string> = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

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
        private readonly regenerateCodesUseCase: RegenerateCodesUseCase,
        private readonly sendSecurityCodeUseCase: SendSecurityCodeUseCase,
        private readonly verifySecurityCodeUseCase: VerifySecurityCodeUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly changeEmailUseCase: ChangeEmailUseCase,
    ) { }

    // ─── Auth Endpoints ─────────────────────────────────────────────────

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

        this.setAuthCookie(response, result.accessToken!);
        return { message: 'Login successful', user: result.user };
    }

    @Post('login/2fa')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login2FA(
        @Body() dto: Login2FADto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const payload = this.verifyTempToken(dto.tempToken);
        await this.validate2FAUseCase.execute(payload.sub, dto.code);

        const { accessToken, user } = await this.generateFullAuth(payload.sub);
        this.setAuthCookie(response, accessToken);

        return { message: '2FA verified successfully', user };
    }

    @Post('login/2fa-recovery')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async login2FARecovery(
        @Body() dto: Login2FARecoveryDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const payload = this.verifyTempToken(dto.tempToken);

        // Use backup code to reset 2FA (disables it)
        await this.reset2FAUseCase.execute(payload.sub, dto.backupCode);

        // Generate full access token and log in
        const { accessToken, user } = await this.generateFullAuth(payload.sub);
        this.setAuthCookie(response, accessToken);

        return {
            message: '2FA has been reset using recovery code. Please set up 2FA again.',
            user,
            twoFactorReset: true,
        };
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
            this.logger.error('[Logout] Error during logout process:', error);
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

    // ─── Security Code Endpoints ────────────────────────────────────────

    @Post('send-security-code')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async sendSecurityCode(@CurrentUser() user: any) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        if (!tenant) throw new UnauthorizedException('User not found');
        await this.sendSecurityCodeUseCase.execute((tenant as any).email);
        return { message: 'Security code sent to your email' };
    }

    @Post('verify-security-code')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verifySecurityCode(@CurrentUser() user: any, @Body() dto: VerifySecurityCodeDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        if (!tenant) throw new UnauthorizedException('User not found');
        await this.verifySecurityCodeUseCase.execute((tenant as any).email, dto.code);
        return { verified: true };
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
        return this.verify2FAUseCase.execute(user.id, dto.code, dto.emailCode);
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
        return this.disable2FAUseCase.execute(user.id, dto.password, dto.code, dto.emailCode);
    }

    @Post('2fa/reset')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async reset2FA(@CurrentUser() user: any, @Body() dto: Reset2FADto) {
        return this.reset2FAUseCase.execute(user.id, dto.backupCode);
    }

    @Post('2fa/regenerate-codes')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async regenerateCodes(@CurrentUser() user: any, @Body() dto: RegenerateCodesDto) {
        return this.regenerateCodesUseCase.execute(user.id, dto.totpCode, dto.emailCode);
    }

    // ─── Password Change ────────────────────────────────────────────────

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
        return this.changePasswordUseCase.execute(user.id, dto.currentPassword, dto.newPassword, dto.emailCode);
    }

    // ─── Email Change ───────────────────────────────────────────────────

    @Post('change-email/request')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async changeEmailRequest(@CurrentUser() user: any) {
        return this.changeEmailUseCase.requestChange(user.id);
    }

    @Post('change-email/verify-old')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async changeEmailVerifyOld(@CurrentUser() user: any, @Body() dto: ChangeEmailVerifyOldDto) {
        return this.changeEmailUseCase.verifyOldEmail(user.id, dto.code);
    }

    @Post('change-email/send-new-code')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async changeEmailSendNewCode(@CurrentUser() user: any, @Body() dto: ChangeEmailSendNewCodeDto) {
        return this.changeEmailUseCase.sendNewEmailCode(user.id, dto.newEmail, dto.tempToken);
    }

    @Post('change-email/confirm')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async changeEmailConfirm(@CurrentUser() user: any, @Body() dto: ChangeEmailConfirmDto) {
        return this.changeEmailUseCase.confirmNewEmail(user.id, dto.newEmail, dto.newEmailCode, dto.tempToken);
    }

    // ─── Private Helpers ────────────────────────────────────────────────

    private verifyTempToken(tempToken: string): any {
        let payload: any;
        try {
            payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired session. Please login again.');
        }

        if (!payload || payload.purpose !== '2fa-pending') {
            throw new UnauthorizedException('Invalid session token.');
        }

        return payload;
    }

    private async generateFullAuth(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new UnauthorizedException('User not found.');

        const accessToken = this.jwtService.sign(
            { sub: tenant.id, email: (tenant as any).email, tokenVersion: (tenant as any).tokenVersion },
            { secret: process.env.JWT_SECRET, expiresIn: '1d' },
        );

        const user = {
            id: tenant.id,
            name: tenant.name,
            email: (tenant as any).email,
            doc_number: tenant.doc_number,
            default_currency: tenant.default_currency,
            preference_locked_until: tenant.preference_locked_until,
            fiatCurrency: (tenant as any).fiatCurrency,
            country: (tenant as any).country,
            language: normalizeLanguage((tenant as any).language),
            theme: (tenant as any).theme || 'system',
            profilePhotoUrl: (tenant as any).profilePhotoUrl || null,
            twoFactorEnabled: (tenant as any).twoFactorEnabled || false,
            isAdmin: (tenant as any).isAdmin || false,
            status: (tenant as any).status || 'PENDING',
            documentRequested: (tenant as any).documentRequested || false,
        };

        return { accessToken, user };
    }

    private setAuthCookie(response: Response, accessToken: string) {
        const domain = process.env.DOMAIN || undefined;
        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
    }
}
