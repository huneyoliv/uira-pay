import { Controller, Post, Body, BadRequestException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { EfiHmacGuard } from '../guards/efi-hmac.guard';
import { CreditBalanceUseCase } from '../../finance/application/credit-balance.usecase';
import { CalculateExchangeUseCase } from '../../finance/application/calculate-exchange.usecase';
import { PrismaService } from '../../../infra/database/prisma.service';

@Controller('webhooks/efi')
export class WebhookController {
    constructor(
        private readonly creditBalanceUseCase: CreditBalanceUseCase,
        private readonly calculateExchangeUseCase: CalculateExchangeUseCase,
        private readonly prisma: PrismaService,
    ) { }

    @Post('pix')
    @UseGuards(EfiHmacGuard)
    async handleWebhook(@Body() payload: any) {
        // Payload structure from Efí: { pix: [ { txid: "...", valor: "...", status: "CONCLUIDA" } ] }

        if (!payload || !payload.pix) {
            // It might be a validation request from Efí (first request has no pix array sometimes)
            return { status: 200 };
        }

        for (const pix of payload.pix) {
            if (pix.status === 'CONCLUIDA') {
                const txid = pix.txid;
                const amount = Number(pix.valor);
                const payerName = pix.pagador?.nome;
                const payerDocument = pix.pagador?.cpf || pix.pagador?.cnpj;

                // 1. Find Order
                const order = await this.prisma.order.findUnique({
                    where: { txid: txid },
                });

                if (!order) {
                    console.warn(`Order not found for txid: ${txid}`);
                    continue;
                }

                if (order.status === 'PAID' || order.status === 'COMPLETED') {
                    console.log(`Order ${order.id} already paid.`);
                    continue;
                }

                // 2. Credit Balance
                // We use the estimated crypto amount from the order to honor the quote if it's recent,
                // but usually we recalculate or use the stored value.
                // For simplicity and fairness to the platform, let's use the stored crypto_amount_est.

                try {
                    await this.creditBalanceUseCase.execute(order.tenant_id, order.crypto_amount_est);

                    // 3. Update Order Status and Payer Info
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'PAID',
                            payerName: payerName,
                            payerDocument: payerDocument
                        },
                    });

                    console.log(`Order ${order.id} processed successfully.`);
                } catch (error) {
                    console.error(`Failed to process order ${order.id}:`, error);
                    // Don't throw here to process other items in the array
                }
            }
        }

        return { status: 200 };
    }
}
