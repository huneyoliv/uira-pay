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
const throttler_1 = require("@nestjs/throttler");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const jwt_auth_guard_1 = require("../../identity/auth/infra/guards/jwt-auth.guard");
let TenantController = class TenantController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics(req) {
        const tenantId = req.user.id;
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [totalSales, wallets, sales24h] = await Promise.all([
            this.prisma.order.aggregate({
                where: {
                    tenant_id: tenantId,
                    status: { in: ['PAID', 'COMPLETED'] },
                },
                _sum: {
                    crypto_amount_est: true,
                },
            }),
            this.prisma.wallet.findMany({
                where: { tenant_id: tenantId },
            }),
            this.prisma.order.aggregate({
                where: {
                    tenant_id: tenantId,
                    status: { in: ['PAID', 'COMPLETED'] },
                    created_at: { gte: yesterday },
                },
                _sum: {
                    crypto_amount_est: true,
                },
            }),
        ]);
        const totalBalance = wallets
            .filter((w) => w.currency === 'USDT' || w.currency === 'USDC')
            .reduce((acc, wallet) => acc + wallet.balance, 0);
        return {
            totalSales: totalSales._sum?.crypto_amount_est || 0,
            balance: totalBalance,
            sales24h: sales24h._sum?.crypto_amount_est || 0,
        };
    }
    async getRecentTransactions(req) {
        const tenantId = req.user.id;
        const transactions = await this.prisma.transaction.findMany({
            where: {
                wallet: {
                    tenant_id: tenantId,
                },
            },
            orderBy: {
                created_at: 'desc',
            },
            take: 10,
            include: {
                wallet: true,
            },
        });
        return transactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            currency: tx.wallet.currency,
            date: tx.created_at,
        }));
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('dashboard/metrics'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard/transactions'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getRecentTransactions", null);
exports.TenantController = TenantController = __decorate([
    (0, common_1.Controller)('tenant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map