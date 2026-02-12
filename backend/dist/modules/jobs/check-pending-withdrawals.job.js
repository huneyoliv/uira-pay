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
var CheckPendingWithdrawalsJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPendingWithdrawalsJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../infra/database/prisma.service");
const binance_provider_1 = require("../payment-crypto/infra/binance.provider");
let CheckPendingWithdrawalsJob = CheckPendingWithdrawalsJob_1 = class CheckPendingWithdrawalsJob {
    prisma;
    binanceProvider;
    logger = new common_1.Logger(CheckPendingWithdrawalsJob_1.name);
    constructor(prisma, binanceProvider) {
        this.prisma = prisma;
        this.binanceProvider = binanceProvider;
    }
    async handleCron() {
        this.logger.debug('Checking pending withdrawals...');
        const pendingWithdrawals = await this.prisma.transaction.findMany({
            where: {
                status: 'PENDING',
                type: 'WITHDRAWAL',
                tx_hash: {
                    not: null,
                },
            },
            include: {
                wallet: true,
            },
        });
        for (const tx of pendingWithdrawals) {
            if (tx.tx_hash === 'INTERNAL_TRANSFER')
                continue;
            try {
                const { status, txHash } = await this.binanceProvider.getWithdrawalStatus(tx.tx_hash);
                if (status === 'COMPLETED') {
                    this.logger.log(`Withdrawal ${tx.id} COMPLETED. Updating...`);
                    await this.prisma.transaction.update({
                        where: { id: tx.id },
                        data: {
                            status: 'COMPLETED',
                            tx_hash: txHash || tx.tx_hash
                        },
                    });
                }
                else if (status === 'FAILED') {
                    this.logger.warn(`Withdrawal ${tx.id} FAILED/REJECTED. Refunding...`);
                    await this.prisma.$transaction([
                        this.prisma.wallet.update({
                            where: { id: tx.wallet_id },
                            data: { balance: { increment: tx.amount + tx.fee } }
                        }),
                        this.prisma.transaction.update({
                            where: { id: tx.id },
                            data: { status: 'FAILED', description: 'Withdrawal rejected by network/exchange' }
                        })
                    ]);
                }
            }
            catch (error) {
                this.logger.error(`Failed to check withdrawal ${tx.id}`, error);
            }
        }
    }
};
exports.CheckPendingWithdrawalsJob = CheckPendingWithdrawalsJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CheckPendingWithdrawalsJob.prototype, "handleCron", null);
exports.CheckPendingWithdrawalsJob = CheckPendingWithdrawalsJob = CheckPendingWithdrawalsJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        binance_provider_1.BinanceProvider])
], CheckPendingWithdrawalsJob);
//# sourceMappingURL=check-pending-withdrawals.job.js.map