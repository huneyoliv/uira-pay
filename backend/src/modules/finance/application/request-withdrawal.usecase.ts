import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { CryptoFeeService } from '../providers/crypto-fee.service';
import { WithdrawService } from '../services/withdraw.service';
import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';

interface RequestWithdrawalDto {
    tenantId: string;
    amount: number;
    network: string;
    address: string;
}

@Injectable()
export class RequestWithdrawalUseCase {
    private readonly logger = new Logger(RequestWithdrawalUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cryptoFeeService: CryptoFeeService,
        private readonly withdrawService: WithdrawService,
        private readonly binanceProvider: BinanceProvider,
    ) { }

    async execute(dto: RequestWithdrawalDto & { save_wallet?: boolean; nickname?: string }) {
        const { tenantId, amount, network, address, save_wallet, nickname } = dto;

        // 1. Get Tenant for Currency Preference
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { wallets: true }
        });

        if (!tenant) throw new NotFoundException('Tenant not found');

        const currency = tenant.default_currency || 'USDT';
        const walletCandidate = tenant.wallets.find(w => w.currency === currency);

        if (!walletCandidate) {
            throw new NotFoundException(`Wallet for ${currency} not found`);
        }

        // 2. Validate Address & Network
        let finalFee = 0;
        const MIN_WITHDRAWAL_AMOUNT = 10;

        if (amount < MIN_WITHDRAWAL_AMOUNT) {
            throw new BadRequestException(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} ${currency}`);
        }

        // SECURITY: Daily withdrawal limit
        const MAX_DAILY_WITHDRAWAL = 5000; // 5000 USDT/USDC per day
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
            throw new BadRequestException(
                `Daily withdrawal limit is ${MAX_DAILY_WITHDRAWAL} ${currency}. Already withdrawn today: ${todayWithdrawals._sum.amount || 0}`
            );
        }

        if (network === 'BINANCE_INTERNAL') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(address)) throw new BadRequestException('Invalid Binance Email Address');
            finalFee = 0;
        } else {
            if (!address || address.length < 10) throw new BadRequestException('Invalid wallet address');
            finalFee = await this.cryptoFeeService.getFee(currency, network);
        }

        const totalDeduction = amount + finalFee;

        // 3. Save Wallet Logic
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

        // 4. PRE-FLIGHT: Check Binance hot wallet liquidity
        const binanceBalance = await this.binanceProvider.getAccountBalance(currency);
        if (binanceBalance < amount) {
            // Attempt auto-rebalance from the other stablecoin
            const otherCoin = currency === 'USDT' ? 'USDC' : 'USDT';
            const otherBalance = await this.binanceProvider.getAccountBalance(otherCoin);
            const deficit = amount - binanceBalance;

            if (otherBalance >= deficit * 1.02) { // 2% margin for slippage
                this.logger.warn(`Low ${currency} (${binanceBalance}). Auto-rebalancing ${deficit} from ${otherCoin}...`);
                try {
                    await this.binanceProvider.rebalance(
                        otherCoin as 'USDT' | 'USDC',
                        currency as 'USDT' | 'USDC',
                        deficit * 1.01, // 1% buffer
                    );
                    this.logger.log(`Auto-rebalance successful: ${deficit} ${otherCoin} → ${currency}`);
                } catch (rebalanceError) {
                    this.logger.error('Auto-rebalance failed', rebalanceError);
                    throw new BadRequestException(
                        `Insufficient platform liquidity for ${currency}. Please try again later or try ${otherCoin}.`
                    );
                }
            } else {
                this.logger.warn(`Insufficient liquidity: ${currency} balance=${binanceBalance}, requested=${amount}`);
                throw new BadRequestException(
                    `Withdrawal temporarily unavailable. Please try a smaller amount or try again later.`
                );
            }
        }

        // 5. ATOMIC BALANCE DEDUCTION via WithdrawService
        const { updatedWallet, transaction } = await this.withdrawService.execute(
            walletCandidate.id,
            totalDeduction,
            amount,
            finalFee,
            network,
            network === 'BINANCE_INTERNAL' ? 'INTERNAL_TRANSFER' : null
        );

        // 6. Execute External Withdrawal
        try {
            // IDEMPOTENCY FIX: Pass the internal Transaction ID to generate the withdrawOrderId
            const txId = await this.cryptoFeeService.withdraw(
                address,
                amount,
                network,
                transaction.id,
                currency,
            );

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

        } catch (error: any) {
            console.error('Withdrawal execution failed:', error);

            // REFUND USER
            // Note: Ideally Refund should also be a Service method with Transaction, 
            // but for now keeping it as is or using another service method if we had one.
            // Using simple update here as rollback.
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
}
