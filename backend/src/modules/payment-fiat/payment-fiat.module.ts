import { Module, forwardRef } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module';
import { EfiGatewayProvider } from './providers/efi-gateway.provider';
import { WebhookController } from './controllers/webhook.controller';
import { OrderController } from './controllers/order.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        forwardRef(() => FinanceModule),
        ConfigModule,
    ],
    controllers: [WebhookController, OrderController],
    providers: [EfiGatewayProvider],
    exports: [EfiGatewayProvider],
})
export class PaymentFiatModule { }
