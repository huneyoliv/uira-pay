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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../identity/auth/infra/guards/jwt-auth.guard");
const prisma_service_1 = require("../../../infra/database/prisma.service");
let WalletController = class WalletController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSavedWallets(req) {
        const tenantId = req.user.id;
        const wallets = await this.prisma.savedWallet.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: 'desc' }
        });
        return wallets;
    }
    async deleteSavedWallet(req, id) {
        const tenantId = req.user.id;
        const wallet = await this.prisma.savedWallet.findUnique({ where: { id } });
        if (!wallet || wallet.tenant_id !== tenantId) {
            throw new common_1.HttpException('Wallet not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.savedWallet.delete({ where: { id } });
        return { message: 'Wallet deleted' };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('saved'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getSavedWallets", null);
__decorate([
    (0, common_1.Delete)('saved/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deleteSavedWallet", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map