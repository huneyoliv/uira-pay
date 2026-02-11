
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import { BinanceProvider } from '../payment-crypto/infra/binance.provider';

@Injectable()
export class CheckPendingWithdrawalsJob {
    private readonly logger = new Logger(CheckPendingWithdrawalsJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly binanceProvider: BinanceProvider,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Checking pending withdrawals...');

        // Find PENDING withdrawals that have a tx_hash (ID from Binance)
        // We exclude internal transfers that might not have a Binance ID yet? 
        // No, current logic sets tx_hash to Binance ID (or 'INTERNAL_TRANSFER' text if custom logic used, but currently returns ID).
        // If it returns 'INTERNAL_TRANSFER' string (from my legacy logic), ensure getWithdrawalStatus handles it or we skip.
        // Binance ID is usually numeric string.

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
            // Skip placeholders if any
            if (tx.tx_hash === 'INTERNAL_TRANSFER') continue;

            try {
                const { status, txHash } = await this.binanceProvider.getWithdrawalStatus(tx.tx_hash!);

                if (status === 'COMPLETED') {
                    this.logger.log(`Withdrawal ${tx.id} COMPLETED. Updating...`);
                    await this.prisma.transaction.update({
                        where: { id: tx.id },
                        data: {
                            status: 'COMPLETED',
                            tx_hash: txHash || tx.tx_hash // Update absolute hash if available (e.g. real txid instead of order id)
                        },
                    });
                } else if (status === 'FAILED') {
                    this.logger.warn(`Withdrawal ${tx.id} FAILED/REJECTED. Refunding...`);

                    // Refund logic (Atomic)
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
                // If PENDING/UNKNOWN, do nothing
            } catch (error) {
                this.logger.error(`Failed to check withdrawal ${tx.id}`, error);
            }
        }
    }
}
