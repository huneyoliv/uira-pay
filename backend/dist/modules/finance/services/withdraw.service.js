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
exports.WithdrawService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infra/database/prisma.service");
let WithdrawService = class WithdrawService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(walletId, totalDeduction, actualWithdrawalAmount, fee, network, txHash = null) {
        return await this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.wallet.updateMany({
                where: {
                    id: walletId,
                    balance: { gte: totalDeduction }
                },
                data: {
                    balance: { decrement: totalDeduction }
                }
            });
            if (updateResult.count === 0) {
                const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
                if (!currentWallet) {
                    throw new common_1.BadRequestException('Wallet not found');
                }
                throw new common_1.BadRequestException(`Insufficient balance. Required: ${totalDeduction} (Available: ${currentWallet.balance})`);
            }
            const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
            const transaction = await tx.transaction.create({
                data: {
                    wallet_id: updatedWallet.id,
                    type: 'WITHDRAWAL',
                    amount: actualWithdrawalAmount,
                    fee: fee,
                    status: 'PENDING',
                    tx_hash: txHash,
                    description: `Withdrawal of ${actualWithdrawalAmount} via ${network}`
                }
            });
            return { updatedWallet, transaction };
        });
    }
};
exports.WithdrawService = WithdrawService;
exports.WithdrawService = WithdrawService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WithdrawService);
//# sourceMappingURL=withdraw.service.js.map