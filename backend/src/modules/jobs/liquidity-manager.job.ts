import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AutoConvertBalanceUseCase } from '../finance/application/auto-convert-balance.usecase';
import { BinanceProvider } from '../payment-crypto/infra/binance.provider';
import { EfiGatewayProvider } from '../payment-fiat/providers/efi-gateway.provider';

@Injectable()
export class LiquidityManagerJob {
    private readonly logger = new Logger(LiquidityManagerJob.name);
    private failureCount = 0;
    private readonly MAX_FAILURES = 3;
    private readonly MIN_RESERVE = 500; // Minimum reserve per stablecoin
    private readonly REBALANCE_THRESHOLD = 200;
    private readonly MAX_REPLENISH_AMOUNT = 10000; // R$ 10.000 max per PIX
    private readonly MIN_EFI_RESERVE = 100; // Keep at least R$ 100 in Efí
    private readonly REPLENISH_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown
    private lastReplenishTime = 0;

    constructor(
        private readonly autoConvertBalanceUseCase: AutoConvertBalanceUseCase,
        private readonly binanceProvider: BinanceProvider,
        private readonly efiGatewayProvider: EfiGatewayProvider,
        private readonly configService: ConfigService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (this.failureCount >= this.MAX_FAILURES) {
            this.logger.error(`Liquidity Manager Job paused due to too many failures (${this.failureCount}). Check logs/Binance API.`);
            return;
        }

        this.logger.debug('Running Liquidity Manager Job...');

        try {
            // 1. Auto Convert BRL → USDT/USDC
            await this.autoConvertBalanceUseCase.execute();

            // 2. Auto-Rebalance between stablecoins if needed
            await this.checkAndRebalance();

            // 3. Auto-Replenish: if both stables are low, buy more via Efí PIX
            await this.checkAndReplenish();

            // Reset failure count on success
            this.failureCount = 0;
        } catch (error) {
            this.failureCount++;
            this.logger.error(`Liquidity Manager Job failed. Attempt ${this.failureCount}/${this.MAX_FAILURES}`, error);
        }
    }

    private async checkAndRebalance() {
        try {
            const balances = await this.binanceProvider.getMultiBalance();

            const usdtLow = balances.USDT < this.MIN_RESERVE;
            const usdcLow = balances.USDC < this.MIN_RESERVE;

            if (usdtLow && !usdcLow && balances.USDC > this.MIN_RESERVE + this.REBALANCE_THRESHOLD) {
                const amountToMove = Math.min(
                    this.MIN_RESERVE - balances.USDT,
                    balances.USDC - this.MIN_RESERVE,
                );
                if (amountToMove > 10) {
                    this.logger.warn(`Auto-rebalancing: ${amountToMove} USDC → USDT`);
                    await this.binanceProvider.rebalance('USDC', 'USDT', amountToMove);
                    this.logger.log('Rebalance USDC→USDT complete.');
                }
            } else if (usdcLow && !usdtLow && balances.USDT > this.MIN_RESERVE + this.REBALANCE_THRESHOLD) {
                const amountToMove = Math.min(
                    this.MIN_RESERVE - balances.USDC,
                    balances.USDT - this.MIN_RESERVE,
                );
                if (amountToMove > 10) {
                    this.logger.warn(`Auto-rebalancing: ${amountToMove} USDT → USDC`);
                    await this.binanceProvider.rebalance('USDT', 'USDC', amountToMove);
                    this.logger.log('Rebalance USDT→USDC complete.');
                }
            }
        } catch (error) {
            this.logger.error('Rebalance check failed (non-critical)', error);
        }
    }

    /**
     * Auto-replenish: if both stablecoins are below reserve, alert or
     * auto-deposit via Binance Pay Merchant API (when configured).
     * 
     * NOTE: Binance public API does NOT support PIX deposit generation.
     * Auto-replenishment requires Binance Pay Merchant approval.
     * Apply at: https://merchant.binance.com
     */
    private async checkAndReplenish() {
        try {
            // Cooldown check
            const now = Date.now();
            if (now - this.lastReplenishTime < this.REPLENISH_COOLDOWN_MS) {
                return;
            }

            const balances = await this.binanceProvider.getMultiBalance();
            const totalStables = balances.USDT + balances.USDC;

            // Only act if BOTH stables are critically low
            if (totalStables >= this.MIN_RESERVE) {
                return;
            }

            // Check if Binance Pay Merchant is configured (future feature)
            const binancePayMerchantId = this.configService.get<string>('BINANCE_PAY_MERCHANT_ID');

            if (binancePayMerchantId) {
                // TODO: When Binance Pay Merchant is approved, implement:
                // 1. Create Binance Pay order (generates PIX code)
                // 2. Pay PIX via Efí (payPixCode)
                // 3. Transfer BRL from Funding → Spot wallet
                // 4. Auto-convert handles BRL → crypto
                this.logger.warn('Binance Pay Merchant configured but integration not yet implemented.');
            }

            // Alert mode: log critical warning for manual action
            this.logger.error(
                `🚨 CRITICAL: Both stablecoins critically low! ` +
                `USDT: ${balances.USDT}, USDC: ${balances.USDC}, BRL on Binance: ${balances.BRL}. ` +
                `Manual BRL deposit to Binance required!`
            );

            // Check Efí balance for informational purposes
            try {
                const efiResponse = await this.efiGatewayProvider.getAccountBalance();
                const efiBrl = parseFloat(efiResponse?.saldo || '0');
                this.logger.warn(`Efí BRL balance available: R$ ${efiBrl.toFixed(2)}`);
            } catch {
                // Non-critical, just skip
            }

            this.lastReplenishTime = now; // Avoid spamming alerts

        } catch (error) {
            this.logger.error('Replenish check failed (non-critical)', error);
        }
    }
}

