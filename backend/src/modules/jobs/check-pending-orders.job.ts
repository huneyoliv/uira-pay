import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import { EfiGatewayProvider } from '../payment-fiat/providers/efi-gateway.provider';
import { CreditBalanceUseCase } from '../finance/application/credit-balance.usecase';

@Injectable()
export class CheckPendingOrdersJob {
    private readonly logger = new Logger(CheckPendingOrdersJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly efiGatewayProvider: EfiGatewayProvider,
        private readonly creditBalanceUseCase: CreditBalanceUseCase,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
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
            if (!order.txid) continue;

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
            } catch (error: any) {
                this.logger.error(`Failed to check/process order ${order.id}`, error);
            }
        }
    }
}
