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
var CheckPendingOrdersJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPendingOrdersJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../infra/database/prisma.service");
const efi_gateway_provider_1 = require("../payment-fiat/providers/efi-gateway.provider");
const credit_balance_usecase_1 = require("../finance/application/credit-balance.usecase");
let CheckPendingOrdersJob = CheckPendingOrdersJob_1 = class CheckPendingOrdersJob {
    prisma;
    efiGatewayProvider;
    creditBalanceUseCase;
    logger = new common_1.Logger(CheckPendingOrdersJob_1.name);
    constructor(prisma, efiGatewayProvider, creditBalanceUseCase) {
        this.prisma = prisma;
        this.efiGatewayProvider = efiGatewayProvider;
        this.creditBalanceUseCase = creditBalanceUseCase;
    }
    async handleCron() {
        this.logger.debug('Checking pending orders...');
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const pendingOrders = await this.prisma.order.findMany({
            where: {
                status: 'PENDING',
                created_at: {
                    lt: fiveMinutesAgo,
                },
                txid: {
                    not: null,
                },
            },
        });
        for (const order of pendingOrders) {
            if (!order.txid)
                continue;
            try {
                const status = await this.efiGatewayProvider.getPixChargeStatus(order.txid);
                if (status === null) {
                    this.logger.warn(`Charge not found for order ${order.id} (txid: ${order.txid}). Retrying next time...`);
                    continue;
                }
                if (status === 'CONCLUIDA') {
                    this.logger.log(`Order ${order.id} found PAID via job. Processing...`);
                    await this.creditBalanceUseCase.execute(order.tenant_id, order.crypto_amount_est);
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: { status: 'PAID' },
                    });
                    this.logger.log(`Order ${order.id} processed successfully.`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to check/process order ${order.id}`, error);
            }
        }
    }
};
exports.CheckPendingOrdersJob = CheckPendingOrdersJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CheckPendingOrdersJob.prototype, "handleCron", null);
exports.CheckPendingOrdersJob = CheckPendingOrdersJob = CheckPendingOrdersJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        efi_gateway_provider_1.EfiGatewayProvider,
        credit_balance_usecase_1.CreditBalanceUseCase])
], CheckPendingOrdersJob);
//# sourceMappingURL=check-pending-orders.job.js.map