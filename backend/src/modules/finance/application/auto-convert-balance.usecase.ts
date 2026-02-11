import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import Decimal from 'decimal.js';

@Injectable()
export class AutoConvertBalanceUseCase {
    private readonly logger = new Logger(AutoConvertBalanceUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly binanceProvider: BinanceProvider,
        private readonly createTransactionUseCase: CreateTransactionUseCase,
    ) { }

    async execute() {
        this.logger.debug('Checking for BRL balance to auto-convert...');

        try {
            // 1. Check BRL Balance
            const brlBalance = await this.binanceProvider.getAccountBalance('BRL');
            if (brlBalance < 10) {
                this.logger.debug(`BRL Balance (${brlBalance}) is below minimum (10 BRL). Skipping conversion.`);
                return;
            }

            // 2. Find Pending Conversion Orders
            const pendingOrders = await this.prisma.order.findMany({
                where: {
                    status: 'PAID',
                    conversion_status: 'PENDING',
                },
                include: {
                    tenant: true,
                },
            });

            if (pendingOrders.length === 0) {
                this.logger.debug('No pending conversion orders found.');
                return;
            }

            // 3. Group by Target Currency (USDT or USDC) based on tenant preference
            const groups: Record<string, { total: Decimal; orderIds: string[] }> = {};

            for (const order of pendingOrders) {
                const targetCurrency = order.tenant?.default_currency || 'USDT';
                if (!groups[targetCurrency]) {
                    groups[targetCurrency] = { total: new Decimal(0), orderIds: [] };
                }
                groups[targetCurrency].total = groups[targetCurrency].total.plus(order.fiat_amount);
                groups[targetCurrency].orderIds.push(order.id);
            }

            // 4. Execute Market Buy for each currency group
            let remainingBrl = new Decimal(brlBalance);

            for (const [currency, group] of Object.entries(groups)) {
                let amountToConvert = group.total;

                // Cap at remaining BRL balance
                if (amountToConvert.gt(remainingBrl)) {
                    this.logger.warn(`${currency} group amount (${amountToConvert}) exceeds remaining BRL (${remainingBrl}). Capping.`);
                    amountToConvert = remainingBrl;
                }

                if (amountToConvert.lt(10)) {
                    this.logger.debug(`${currency} group amount (${amountToConvert}) below minimum. Skipping.`);
                    continue;
                }

                const pair = `${currency}/BRL`;
                this.logger.log(`Executing Market Buy: ${pair}, Amount: R$ ${amountToConvert}`);

                const orderResult = await this.binanceProvider.createMarketBuyOrder(pair, amountToConvert.toNumber());

                if (orderResult && orderResult.status === 'closed') {
                    const bought = orderResult.filled;
                    const spent = orderResult.cost;
                    const rate = orderResult.average || (spent / bought);

                    this.logger.log(`AUDIT: Convertido R$ ${spent} -> ${bought} ${currency} @ ${rate.toFixed(4)}`);

                    await this.prisma.order.updateMany({
                        where: { id: { in: group.orderIds } },
                        data: { conversion_status: 'COMPLETED' },
                    });

                    remainingBrl = remainingBrl.minus(spent);
                    this.logger.log(`Updated ${group.orderIds.length} orders to COMPLETED (${currency}).`);
                } else {
                    this.logger.error(`Market Order failed for ${pair}.`, orderResult);
                }
            }

        } catch (error) {
            this.logger.error('Failed to auto-convert balance', error);
        }
    }
}
