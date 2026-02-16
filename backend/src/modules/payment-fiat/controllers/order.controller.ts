import { Controller, Post, Body, UseGuards, Req, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { CalculateExchangeUseCase } from '../../finance/application/calculate-exchange.usecase';
import { EfiGatewayProvider } from '../providers/efi-gateway.provider';
import { BcbService } from '../../finance/providers/bcb.service';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';
import { PrismaService } from '../../../infra/database/prisma.service';
import { CurrentUser } from '../../identity/auth/infra/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(
        private readonly calculateExchangeUseCase: CalculateExchangeUseCase,
        private readonly efiGatewayProvider: EfiGatewayProvider,
        private readonly prisma: PrismaService,
        private readonly bcbService: BcbService,
    ) { }

    @Post()
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async createOrder(@Body() body: CreateOrderDto, @CurrentUser() user: any) {
        // SECURITY: Order value limits
        const MAX_ORDER_AMOUNT = 50000; // R$ 50.000 max per order
        const MAX_PENDING_ORDERS = 5;

        if (body.amount > MAX_ORDER_AMOUNT) {
            throw new BadRequestException(`Maximum order amount is R$ ${MAX_ORDER_AMOUNT.toLocaleString()}`);
        }

        // Check pending orders limit
        const pendingCount = await this.prisma.order.count({
            where: { tenant_id: user.id, status: 'PENDING' },
        });
        if (pendingCount >= MAX_PENDING_ORDERS) {
            throw new BadRequestException(`Maximum of ${MAX_PENDING_ORDERS} pending orders allowed`);
        }

        // 0. Get Tenant Currency
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        const currency = tenant?.fiatCurrency || 'BRL';
        let amountBrl = body.amount;
        let exchangeRateBcb = 1;

        if (currency !== 'BRL') {
            exchangeRateBcb = await this.bcbService.getExchangeRate(currency);
            amountBrl = body.amount * exchangeRateBcb;
        }

        // 1. Calculate Exchange
        // We need the BRL -> USDT rate (using USD as proxy).
        let usdBrlRate = exchangeRateBcb;
        if (currency === 'BRL') {
            // If input is BRL, we need to fetch the USD rate to estimate USDT amount
            usdBrlRate = await this.bcbService.getExchangeRate('USD');
        }

        const exchangeResult = this.calculateExchangeUseCase.execute(amountBrl, usdBrlRate);

        // 2. Generate Pix Charge (always BRL)
        const pixCharge = await this.efiGatewayProvider.createPixCharge(amountBrl);

        // 3. Persist Order
        const order = await this.prisma.order.create({
            data: {
                tenant_id: user.id,
                fiat_amount: amountBrl, // Storing BRL amount for now as the system seems BRL-centric
                crypto_amount_est: exchangeResult.netCryptoAmount,
                status: 'PENDING',
                pix_code: pixCharge.pixCode,
                txid: pixCharge.txid,
            } as any,
        });

        // 4. Return combined result
        return {
            id: order.id,
            pixCode: pixCharge.pixCode,
            txid: pixCharge.txid,
            exchangeRate: exchangeResult.exchangeRate, // BRL to USDT rate
            netCryptoAmount: exchangeResult.netCryptoAmount,
            totalFeeBrl: exchangeResult.totalFeeBrl,
            originalAmount: body.amount,
            originalCurrency: currency,
            conversionRate: exchangeRateBcb, // USD to BRL rate
        };
    }

    @Get(':id')
    async getOrder(@Param('id') id: string, @CurrentUser() user: any) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order || order.tenant_id !== user.id) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }
}
