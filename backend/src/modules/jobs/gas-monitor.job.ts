import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BinanceProvider } from '../payment-crypto/infra/binance.provider';

@Injectable()
export class GasMonitorJob {
    private readonly logger = new Logger(GasMonitorJob.name);
    private readonly MIN_RESERVE = 500; // Minimum reserve per stablecoin

    constructor(
        private readonly binanceProvider: BinanceProvider,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.debug('Checking crypto balances...');

        try {
            const balances = await this.binanceProvider.getMultiBalance();

            this.logger.log(`Balances — USDT: ${balances.USDT} | USDC: ${balances.USDC} | BRL: ${balances.BRL}`);

            if (balances.USDT < this.MIN_RESERVE) {
                this.logger.warn(`⚠️ Low USDT Balance: ${balances.USDT} (min: ${this.MIN_RESERVE})`);
            }
            if (balances.USDC < this.MIN_RESERVE) {
                this.logger.warn(`⚠️ Low USDC Balance: ${balances.USDC} (min: ${this.MIN_RESERVE})`);
            }
        } catch (error) {
            this.logger.error('Failed to check balances', error);
        }
    }
}
