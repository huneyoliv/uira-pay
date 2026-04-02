"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const register_tenant_usecase_1 = require("./application/register-tenant.usecase");
const login_usecase_1 = require("./application/login.usecase");
const register_tenant_dto_1 = require("./application/dtos/register-tenant.dto");
const login_dto_1 = require("./application/dtos/login.dto");
const send_verification_dto_1 = require("./application/dtos/send-verification.dto");
const verify_code_dto_1 = require("./application/dtos/verify-code.dto");
const reset_password_dto_1 = require("./application/dtos/reset-password.dto");
const totp_dto_1 = require("./application/dtos/totp.dto");
const send_verification_code_usecase_1 = require("./application/send-verification-code.usecase");
const verify_code_usecase_1 = require("./application/verify-code.usecase");
const forgot_password_usecase_1 = require("./application/forgot-password.usecase");
const reset_password_usecase_1 = require("./application/reset-password.usecase");
const logout_usecase_1 = require("./application/logout.usecase");
const setup_2fa_usecase_1 = require("./application/totp/setup-2fa.usecase");
const verify_2fa_usecase_1 = require("./application/totp/verify-2fa.usecase");
const validate_2fa_usecase_1 = require("./application/totp/validate-2fa.usecase");
const disable_2fa_usecase_1 = require("./application/totp/disable-2fa.usecase");
const reset_2fa_usecase_1 = require("./application/totp/reset-2fa.usecase");
const regenerate_codes_usecase_1 = require("./application/totp/regenerate-codes.usecase");
const send_security_code_usecase_1 = require("./application/send-security-code.usecase");
const verify_security_code_usecase_1 = require("./application/verify-security-code.usecase");
const change_password_usecase_1 = require("./application/change-password.usecase");
const change_email_usecase_1 = require("./application/change-email.usecase");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const jwt_auth_guard_1 = require("./infra/guards/jwt-auth.guard");
const current_user_decorator_1 = require("./infra/decorators/current-user.decorator");
const jwt_1 = require("@nestjs/jwt");
function normalizeLanguage(lang) {
    if (!lang)
        return 'PT';
    const map = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR' };
    return map[lang] || lang?.split('-')[0]?.toUpperCase() || 'PT';
}
let AuthController = AuthController_1 = class AuthController {
    prisma;
    registerTenantUseCase;
    loginUseCase;
    sendVerificationCodeUseCase;
    verifyCodeUseCase;
    forgotPasswordUseCase;
    resetPasswordUseCase;
    logoutUseCase;
    jwtService;
    setup2FAUseCase;
    verify2FAUseCase;
    validate2FAUseCase;
    disable2FAUseCase;
    reset2FAUseCase;
    regenerateCodesUseCase;
    sendSecurityCodeUseCase;
    verifySecurityCodeUseCase;
    changePasswordUseCase;
    changeEmailUseCase;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(prisma, registerTenantUseCase, loginUseCase, sendVerificationCodeUseCase, verifyCodeUseCase, forgotPasswordUseCase, resetPasswordUseCase, logoutUseCase, jwtService, setup2FAUseCase, verify2FAUseCase, validate2FAUseCase, disable2FAUseCase, reset2FAUseCase, regenerateCodesUseCase, sendSecurityCodeUseCase, verifySecurityCodeUseCase, changePasswordUseCase, changeEmailUseCase) {
        this.prisma = prisma;
        this.registerTenantUseCase = registerTenantUseCase;
        this.loginUseCase = loginUseCase;
        this.sendVerificationCodeUseCase = sendVerificationCodeUseCase;
        this.verifyCodeUseCase = verifyCodeUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.logoutUseCase = logoutUseCase;
        this.jwtService = jwtService;
        this.setup2FAUseCase = setup2FAUseCase;
        this.verify2FAUseCase = verify2FAUseCase;
        this.validate2FAUseCase = validate2FAUseCase;
        this.disable2FAUseCase = disable2FAUseCase;
        this.reset2FAUseCase = reset2FAUseCase;
        this.regenerateCodesUseCase = regenerateCodesUseCase;
        this.sendSecurityCodeUseCase = sendSecurityCodeUseCase;
        this.verifySecurityCodeUseCase = verifySecurityCodeUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.changeEmailUseCase = changeEmailUseCase;
    }
    async register(dto) {
        return this.registerTenantUseCase.execute(dto);
    }
    async login(dto, response) {
        const result = await this.loginUseCase.execute(dto);
        if (result.requires2FA) {
            return {
                message: '2FA verification required',
                requires2FA: true,
                tempToken: result.tempToken,
                user: result.user,
            };
        }
        this.setAuthCookie(response, result.accessToken);
        return { message: 'Login successful', user: result.user };
    }
    async login2FA(dto, response) {
        const payload = this.verifyTempToken(dto.tempToken);
        await this.validate2FAUseCase.execute(payload.sub, dto.code);
        const { accessToken, user } = await this.generateFullAuth(payload.sub);
        this.setAuthCookie(response, accessToken);
        return { message: '2FA verified successfully', user };
    }
    async login2FARecovery(dto, response) {
        const payload = this.verifyTempToken(dto.tempToken);
        await this.reset2FAUseCase.execute(payload.sub, dto.backupCode);
        const { accessToken, user } = await this.generateFullAuth(payload.sub);
        this.setAuthCookie(response, accessToken);
        return {
            message: '2FA has been reset using recovery code. Please set up 2FA again.',
            user,
            twoFactorReset: true,
        };
    }
    async sendVerification(dto) {
        await this.sendVerificationCodeUseCase.execute(dto.email, dto.language || 'PT');
        return { message: 'Verification code sent' };
    }
    async verifyCode(dto) {
        return this.verifyCodeUseCase.execute(dto.email, dto.code);
    }
    async logout(req, response) {
        try {
            let token = req.cookies['access_token'];
            if (token) {
                try {
                    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
                    if (payload && payload.sub) {
                        await this.logoutUseCase.execute(payload.sub);
                    }
                }
                catch (tokenError) {
                }
            }
        }
        catch (error) {
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
    async forgotPassword(email) {
        await this.forgotPasswordUseCase.execute(email);
        return { message: 'If the email exists, a recovery code has been sent.' };
    }
    async resetPassword(dto) {
        await this.resetPasswordUseCase.execute(dto.email, dto.code, dto.newPassword);
        return { message: 'Password reset successfully' };
    }
    async sendSecurityCode(user) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        if (!tenant)
            throw new common_1.UnauthorizedException('User not found');
        await this.sendSecurityCodeUseCase.execute(tenant.email);
        return { message: 'Security code sent to your email' };
    }
    async verifySecurityCode(user, dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        if (!tenant)
            throw new common_1.UnauthorizedException('User not found');
        await this.verifySecurityCodeUseCase.execute(tenant.email, dto.code);
        return { verified: true };
    }
    async setup2FA(user) {
        return this.setup2FAUseCase.execute(user.id);
    }
    async verify2FA(user, dto) {
        return this.verify2FAUseCase.execute(user.id, dto.code, dto.emailCode);
    }
    async validate2FA(user, dto) {
        return this.validate2FAUseCase.execute(user.id, dto.code);
    }
    async disable2FA(user, dto) {
        return this.disable2FAUseCase.execute(user.id, dto.password, dto.code, dto.emailCode);
    }
    async reset2FA(user, dto) {
        return this.reset2FAUseCase.execute(user.id, dto.backupCode);
    }
    async regenerateCodes(user, dto) {
        return this.regenerateCodesUseCase.execute(user.id, dto.password, dto.totpCode, dto.emailCode);
    }
    async changePassword(user, dto) {
        return this.changePasswordUseCase.execute(user.id, dto.currentPassword, dto.newPassword, dto.emailCode, dto.totpCode);
    }
    async changeEmailRequest(user) {
        return this.changeEmailUseCase.requestChange(user.id);
    }
    async changeEmailVerifyOld(user, dto) {
        return this.changeEmailUseCase.verifyOldEmail(user.id, dto.code, dto.totpCode);
    }
    async changeEmailSendNewCode(user, dto) {
        return this.changeEmailUseCase.sendNewEmailCode(user.id, dto.newEmail, dto.tempToken);
    }
    async changeEmailConfirm(user, dto) {
        return this.changeEmailUseCase.confirmNewEmail(user.id, dto.newEmail, dto.newEmailCode, dto.tempToken);
    }
    verifyTempToken(tempToken) {
        let payload;
        try {
            payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired session. Please login again.');
        }
        if (!payload || payload.purpose !== '2fa-pending') {
            throw new common_1.UnauthorizedException('Invalid session token.');
        }
        return payload;
    }
    async generateFullAuth(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.UnauthorizedException('User not found.');
        const accessToken = this.jwtService.sign({ sub: tenant.id, email: tenant.email, tokenVersion: tenant.tokenVersion }, { secret: process.env.JWT_SECRET, expiresIn: '1d' });
        const user = {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            doc_number: tenant.doc_number,
            default_currency: tenant.default_currency,
            preference_locked_until: tenant.preference_locked_until,
            fiatCurrency: tenant.fiatCurrency,
            country: tenant.country,
            language: normalizeLanguage(tenant.language),
            theme: tenant.theme || 'system',
            profilePhotoUrl: tenant.profilePhotoUrl || null,
            twoFactorEnabled: tenant.twoFactorEnabled || false,
            isAdmin: tenant.isAdmin || false,
            status: tenant.status || 'PENDING',
            documentRequested: tenant.documentRequested || false,
        };
        return { accessToken, user };
    }
    setAuthCookie(response, accessToken) {
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_tenant_dto_1.RegisterTenantDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login/2fa'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [totp_dto_1.Login2FADto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login2FA", null);
__decorate([
    (0, common_1.Post)('login/2fa-recovery'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [totp_dto_1.Login2FARecoveryDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login2FARecovery", null);
__decorate([
    (0, common_1.Post)('send-verification'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_verification_dto_1.SendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerification", null);
__decorate([
    (0, common_1.Post)('verify-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_code_dto_1.VerifyCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('send-security-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendSecurityCode", null);
__decorate([
    (0, common_1.Post)('verify-security-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.VerifySecurityCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySecurityCode", null);
__decorate([
    (0, common_1.Post)('2fa/setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.Post)('2fa/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.Verify2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.Post)('2fa/validate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.Validate2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validate2FA", null);
__decorate([
    (0, common_1.Post)('2fa/disable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.Disable2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Post)('2fa/reset'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.Reset2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reset2FA", null);
__decorate([
    (0, common_1.Post)('2fa/regenerate-codes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.RegenerateCodesDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "regenerateCodes", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('change-email/request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeEmailRequest", null);
__decorate([
    (0, common_1.Post)('change-email/verify-old'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.ChangeEmailVerifyOldDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeEmailVerifyOld", null);
__decorate([
    (0, common_1.Post)('change-email/send-new-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.ChangeEmailSendNewCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeEmailSendNewCode", null);
__decorate([
    (0, common_1.Post)('change-email/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, totp_dto_1.ChangeEmailConfirmDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeEmailConfirm", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        register_tenant_usecase_1.RegisterTenantUseCase,
        login_usecase_1.LoginUseCase,
        send_verification_code_usecase_1.SendVerificationCodeUseCase,
        verify_code_usecase_1.VerifyCodeUseCase,
        forgot_password_usecase_1.ForgotPasswordUseCase,
        reset_password_usecase_1.ResetPasswordUseCase,
        logout_usecase_1.LogoutUseCase,
        jwt_1.JwtService,
        setup_2fa_usecase_1.Setup2FAUseCase,
        verify_2fa_usecase_1.Verify2FAUseCase,
        validate_2fa_usecase_1.Validate2FAUseCase,
        disable_2fa_usecase_1.Disable2FAUseCase,
        reset_2fa_usecase_1.Reset2FAUseCase,
        regenerate_codes_usecase_1.RegenerateCodesUseCase,
        send_security_code_usecase_1.SendSecurityCodeUseCase,
        verify_security_code_usecase_1.VerifySecurityCodeUseCase,
        change_password_usecase_1.ChangePasswordUseCase,
        change_email_usecase_1.ChangeEmailUseCase])
], AuthController);
//# sourceMappingURL=auth.controller.js.map