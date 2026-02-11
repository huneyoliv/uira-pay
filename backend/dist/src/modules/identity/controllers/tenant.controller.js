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
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const update_config_dto_1 = require("../dtos/update-config.dto");
const wallet_repository_interface_1 = require("../../finance/domain/wallet.repository.interface");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const jwt_auth_guard_1 = require("../auth/infra/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/infra/decorators/current-user.decorator");
let TenantController = class TenantController {
    walletRepository;
    prisma;
    constructor(walletRepository, prisma) {
        this.walletRepository = walletRepository;
        this.prisma = prisma;
    }
    async getBalance(user) {
        const tenantId = user.id;
        const wallet = await this.walletRepository.findByTenantId(tenantId);
        if (!wallet) {
            return { balance: 0, currency: 'USDT' };
        }
        return {
            balance: wallet.balance,
            currency: wallet.currency,
        };
    }
    async updateConfig(body, user) {
        const tenantId = user.id;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const currentTenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (body.defaultCurrency && currentTenant && currentTenant.preference_locked_until > new Date()) {
            throw new common_1.ForbiddenException(`Mudança bloqueada até ${currentTenant.preference_locked_until.toISOString()}`);
        }
        if (body.docNumber) {
            if (!body.currentPassword) {
                throw new common_1.BadRequestException('Current password is required to change document number');
            }
            const bcrypt = await import('bcrypt');
            const isPasswordValid = await bcrypt.compare(body.currentPassword, currentTenant.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
        }
        const dataToUpdate = {
            ...(body.docNumber ? { doc_number: body.docNumber } : {}),
            ...(body.language ? { language: body.language } : {}),
            ...(body.theme ? { theme: body.theme } : {}),
        };
        if (body.defaultCurrency) {
            dataToUpdate.default_currency = body.defaultCurrency;
            dataToUpdate.preference_locked_until = new Date(new Date().setMonth(new Date().getMonth() + 6));
        }
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: dataToUpdate,
        });
        return { success: true };
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Patch)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_config_dto_1.UpdateConfigDto, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateConfig", null);
exports.TenantController = TenantController = __decorate([
    (0, common_1.Controller)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wallet_repository_interface_1.IWalletRepository,
        prisma_service_1.PrismaService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map