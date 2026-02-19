"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const register_tenant_usecase_1 = require("./application/register-tenant.usecase");
const login_usecase_1 = require("./application/login.usecase");
const bcrypt_hasher_1 = require("./infra/bcrypt.hasher");
const jwt_token_provider_1 = require("./infra/jwt.token.provider");
const jwt_strategy_1 = require("./infra/strategies/jwt.strategy");
const password_hasher_interface_1 = require("./domain/password.hasher.interface");
const token_provider_interface_1 = require("./domain/token.provider.interface");
const infra_module_1 = require("../../../infra/infra.module");
const email_service_1 = require("../infra/services/email.service");
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
const encryption_service_1 = require("./application/encryption.service");
const send_security_code_usecase_1 = require("./application/send-security-code.usecase");
const verify_security_code_usecase_1 = require("./application/verify-security-code.usecase");
const change_password_usecase_1 = require("./application/change-password.usecase");
const change_email_usecase_1 = require("./application/change-email.usecase");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            infra_module_1.InfraModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: () => {
                    const secret = process.env.JWT_SECRET;
                    if (!secret) {
                        throw new Error('FATAL: JWT_SECRET environment variable is not defined. Application cannot start.');
                    }
                    return {
                        secret,
                        signOptions: { expiresIn: '1h' },
                    };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            register_tenant_usecase_1.RegisterTenantUseCase,
            login_usecase_1.LoginUseCase,
            jwt_strategy_1.JwtStrategy,
            {
                provide: password_hasher_interface_1.IPasswordHasher,
                useClass: bcrypt_hasher_1.BcryptHasher,
            },
            {
                provide: token_provider_interface_1.ITokenProvider,
                useClass: jwt_token_provider_1.JwtTokenProvider,
            },
            email_service_1.EmailService,
            send_verification_code_usecase_1.SendVerificationCodeUseCase,
            verify_code_usecase_1.VerifyCodeUseCase,
            forgot_password_usecase_1.ForgotPasswordUseCase,
            reset_password_usecase_1.ResetPasswordUseCase,
            logout_usecase_1.LogoutUseCase,
            setup_2fa_usecase_1.Setup2FAUseCase,
            verify_2fa_usecase_1.Verify2FAUseCase,
            validate_2fa_usecase_1.Validate2FAUseCase,
            disable_2fa_usecase_1.Disable2FAUseCase,
            reset_2fa_usecase_1.Reset2FAUseCase,
            regenerate_codes_usecase_1.RegenerateCodesUseCase,
            encryption_service_1.EncryptionService,
            send_security_code_usecase_1.SendSecurityCodeUseCase,
            verify_security_code_usecase_1.VerifySecurityCodeUseCase,
            change_password_usecase_1.ChangePasswordUseCase,
            change_email_usecase_1.ChangeEmailUseCase,
        ],
        exports: [jwt_strategy_1.JwtStrategy, passport_1.PassportModule, validate_2fa_usecase_1.Validate2FAUseCase],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map