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
var RequestWithdrawalUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestWithdrawalUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const crypto_fee_service_1 = require("../providers/crypto-fee.service");
const withdraw_service_1 = require("../services/withdraw.service");
const binance_provider_1 = require("../../payment-crypto/infra/binance.provider");
let RequestWithdrawalUseCase = RequestWithdrawalUseCase_1 = class RequestWithdrawalUseCase {
    prisma;
    cryptoFeeService;
    withdrawService;
    binanceProvider;
    logger = new common_1.Logger(RequestWithdrawalUseCase_1.name);
    constructor(prisma, cryptoFeeService, withdrawService, binanceProvider) {
        this.prisma = prisma;
        this.cryptoFeeService = cryptoFeeService;
        this.withdrawService = withdrawService;
        this.binanceProvider = binanceProvider;
    }
    async execute(dto) {
        const { tenantId, amount, network, address, save_wallet, nickname } = dto;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { wallets: true }
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const currency = tenant.default_currency || 'USDT';
        const walletCandidate = tenant.wallets.find(w => w.currency === currency);
        if (!walletCandidate) {
            throw new common_1.NotFoundException(`Wallet for ${currency} not found`);
        }
        let finalFee = 0;
        const MIN_WITHDRAWAL_AMOUNT = 10;
        if (amount < MIN_WITHDRAWAL_AMOUNT) {
            throw new common_1.BadRequestException(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} ${currency}`);
        }
        const MAX_DAILY_WITHDRAWAL = 5000;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayWithdrawals = await this.prisma.transaction.aggregate({
            where: {
                wallet: { tenant_id: tenantId },
                type: 'WITHDRAWAL',
                status: { in: ['COMPLETED', 'PENDING'] },
                created_at: { gte: todayStart },
            },
            _sum: { amount: true },
        });
        const totalToday = (todayWithdrawals._sum.amount || 0) + amount;
        if (totalToday > MAX_DAILY_WITHDRAWAL) {
            throw new common_1.BadRequestException(`Daily withdrawal limit is ${MAX_DAILY_WITHDRAWAL} ${currency}. Already withdrawn today: ${todayWithdrawals._sum.amount || 0}`);
        }
        if (network === 'BINANCE_INTERNAL') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(address))
                throw new common_1.BadRequestException('Invalid Binance Email Address');
            finalFee = 0;
        }
        else {
            if (!address || address.length < 10)
                throw new common_1.BadRequestException('Invalid wallet address');
            finalFee = await this.cryptoFeeService.getFee(currency, network);
        }
        const totalDeduction = amount + finalFee;
        if (save_wallet && network !== 'BINANCE_INTERNAL') {
            const count = await this.prisma.savedWallet.count({ where: { tenant_id: tenantId } });
            if (count < 3) {
                const existing = await this.prisma.savedWallet.findFirst({
                    where: { tenant_id: tenantId, address: address, network: network }
                });
                if (!existing) {
                    await this.prisma.savedWallet.create({
                        data: {
                            tenant_id: tenantId,
                            address: address,
                            network: network,
                            nickname: nickname || 'Minha Carteira',
                        }
                    });
                }
            }
        }
        const binanceBalance = await this.binanceProvider.getAccountBalance(currency);
        if (binanceBalance < amount) {
            const otherCoin = currency === 'USDT' ? 'USDC' : 'USDT';
            const otherBalance = await this.binanceProvider.getAccountBalance(otherCoin);
            const deficit = amount - binanceBalance;
            if (otherBalance >= deficit * 1.02) {
                this.logger.warn(`Low ${currency} (${binanceBalance}). Auto-rebalancing ${deficit} from ${otherCoin}...`);
                try {
                    await this.binanceProvider.rebalance(otherCoin, currency, deficit * 1.01);
                    this.logger.log(`Auto-rebalance successful: ${deficit} ${otherCoin} → ${currency}`);
                }
                catch (rebalanceError) {
                    this.logger.error('Auto-rebalance failed', rebalanceError);
                    throw new common_1.BadRequestException(`Insufficient platform liquidity for ${currency}. Please try again later or try ${otherCoin}.`);
                }
            }
            else {
                throw new common_1.BadRequestException(`Insufficient platform liquidity for ${currency}. Available: ${binanceBalance}. Please try a smaller amount or try later.`);
            }
        }
        const { updatedWallet, transaction } = await this.withdrawService.execute(walletCandidate.id, totalDeduction, amount, finalFee, network, network === 'BINANCE_INTERNAL' ? 'INTERNAL_TRANSFER' : null);
        try {
            const txId = await this.cryptoFeeService.withdraw(address, amount, network, transaction.id, currency);
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'PENDING',
                    tx_hash: txId
                }
            });
            return {
                transaction,
                updatedWallet,
                status: 'PENDING',
                txHash: txId
            };
        }
        catch (error) {
            console.error('Withdrawal execution failed:', error);
            await this.prisma.$transaction([
                this.prisma.wallet.update({
                    where: { id: updatedWallet.id },
                    data: { balance: { increment: totalDeduction } }
                }),
                this.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'FAILED', description: error.message || 'Binance Error' }
                })
            ]);
            throw error;
        }
    }
};
exports.RequestWithdrawalUseCase = RequestWithdrawalUseCase;
exports.RequestWithdrawalUseCase = RequestWithdrawalUseCase = RequestWithdrawalUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_fee_service_1.CryptoFeeService,
        withdraw_service_1.WithdrawService,
        binance_provider_1.BinanceProvider])
], RequestWithdrawalUseCase);
//# sourceMappingURL=request-withdrawal.usecase.js.map