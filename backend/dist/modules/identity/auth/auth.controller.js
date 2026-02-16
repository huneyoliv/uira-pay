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
const send_verification_code_usecase_1 = require("./application/send-verification-code.usecase");
const verify_code_usecase_1 = require("./application/verify-code.usecase");
const forgot_password_usecase_1 = require("./application/forgot-password.usecase");
const reset_password_usecase_1 = require("./application/reset-password.usecase");
const logout_usecase_1 = require("./application/logout.usecase");
const common_2 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    registerTenantUseCase;
    loginUseCase;
    sendVerificationCodeUseCase;
    verifyCodeUseCase;
    forgotPasswordUseCase;
    resetPasswordUseCase;
    logoutUseCase;
    jwtService;
    constructor(registerTenantUseCase, loginUseCase, sendVerificationCodeUseCase, verifyCodeUseCase, forgotPasswordUseCase, resetPasswordUseCase, logoutUseCase, jwtService) {
        this.registerTenantUseCase = registerTenantUseCase;
        this.loginUseCase = loginUseCase;
        this.sendVerificationCodeUseCase = sendVerificationCodeUseCase;
        this.verifyCodeUseCase = verifyCodeUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.logoutUseCase = logoutUseCase;
        this.jwtService = jwtService;
    }
    async register(dto, response) {
        const result = await this.registerTenantUseCase.execute(dto);
        const domain = process.env.DOMAIN || undefined;
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        return { message: 'Registered successfully', user: result.user };
    }
    async login(dto, response) {
        const result = await this.loginUseCase.execute(dto);
        const domain = process.env.DOMAIN || undefined;
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: domain ? `.${domain}` : undefined,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        return { message: 'Login successful', user: result.user };
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
                        console.log(`[Logout] Token revoked for user ${payload.sub}`);
                    }
                }
                catch (tokenError) {
                    console.warn('[Logout] Token invalid or expired. Proceeding to clear cookies.', tokenError.message);
                }
            }
        }
        catch (error) {
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
    async forgotPassword(email) {
        await this.forgotPasswordUseCase.execute(email);
        return { message: 'If the email exists, a recovery code has been sent.' };
    }
    async resetPassword(dto) {
        await this.resetPasswordUseCase.execute(dto.email, dto.code, dto.newPassword);
        return { message: 'Password reset successfully' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_tenant_dto_1.RegisterTenantDto, Object]),
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
    __param(0, (0, common_2.Req)()),
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
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [register_tenant_usecase_1.RegisterTenantUseCase,
        login_usecase_1.LoginUseCase,
        send_verification_code_usecase_1.SendVerificationCodeUseCase,
        verify_code_usecase_1.VerifyCodeUseCase,
        forgot_password_usecase_1.ForgotPasswordUseCase,
        reset_password_usecase_1.ResetPasswordUseCase,
        logout_usecase_1.LogoutUseCase,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map