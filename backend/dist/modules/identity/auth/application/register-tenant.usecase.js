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
exports.RegisterTenantUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const password_hasher_interface_1 = require("../domain/password.hasher.interface");
const token_provider_interface_1 = require("../domain/token.provider.interface");
const jwt_1 = require("@nestjs/jwt");
let RegisterTenantUseCase = class RegisterTenantUseCase {
    prisma;
    passwordHasher;
    tokenProvider;
    jwtService;
    constructor(prisma, passwordHasher, tokenProvider, jwtService) {
        this.prisma = prisma;
        this.passwordHasher = passwordHasher;
        this.tokenProvider = tokenProvider;
        this.jwtService = jwtService;
    }
    async execute(dto) {
        try {
            const payload = this.jwtService.verify(dto.verificationToken, {
                secret: process.env.JWT_SECRET,
            });
            if (!payload.verified || payload.email !== dto.email) {
                throw new common_1.BadRequestException('Invalid or mismatched verification token');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { email: dto.email },
        });
        if (existingTenant) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                doc_number: dto.docNumber,
                email: dto.email,
                password: hashedPassword,
                documentUrl: dto.documentUrl,
                country: dto.country,
                fiatCurrency: dto.fiatCurrency,
                preference_locked_until: new Date(),
            },
        });
        await this.prisma.wallet.create({
            data: {
                tenant_id: tenant.id,
                currency: 'USDT',
                balance: 0,
            },
        });
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
                profilePhotoUrl: null,
                twoFactorEnabled: false,
                isAdmin: false,
            }
        };
    }
};
exports.RegisterTenantUseCase = RegisterTenantUseCase;
exports.RegisterTenantUseCase = RegisterTenantUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_hasher_interface_1.IPasswordHasher,
        token_provider_interface_1.ITokenProvider,
        jwt_1.JwtService])
], RegisterTenantUseCase);
//# sourceMappingURL=register-tenant.usecase.js.map