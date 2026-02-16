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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const password_hasher_interface_1 = require("../domain/password.hasher.interface");
const token_provider_interface_1 = require("../domain/token.provider.interface");
let LoginUseCase = class LoginUseCase {
    prisma;
    passwordHasher;
    tokenProvider;
    constructor(prisma, passwordHasher, tokenProvider) {
        this.prisma = prisma;
        this.passwordHasher = passwordHasher;
        this.tokenProvider = tokenProvider;
    }
    async execute(dto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.passwordHasher.compare(dto.password, tenant.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.tokenProvider.sign({ sub: tenant.id, email: tenant.email, tokenVersion: tenant.tokenVersion });
        return {
            accessToken,
            user: {
                id: tenant.id,
                name: tenant.name,
                email: tenant.email,
                doc_number: tenant.doc_number,
                default_currency: tenant.default_currency,
                preference_locked_until: tenant.preference_locked_until,
                fiatCurrency: tenant.fiatCurrency,
                country: tenant.country,
                language: tenant.language || 'PT',
                theme: tenant.theme || 'system',
                profilePhotoUrl: tenant.profilePhotoUrl || null,
                twoFactorEnabled: tenant.twoFactorEnabled || false,
                isAdmin: tenant.isAdmin || false,
            }
        };
    }
};
exports.LoginUseCase = LoginUseCase;
exports.LoginUseCase = LoginUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_hasher_interface_1.IPasswordHasher,
        token_provider_interface_1.ITokenProvider])
], LoginUseCase);
//# sourceMappingURL=login.usecase.js.map