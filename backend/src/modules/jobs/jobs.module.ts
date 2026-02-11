import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FinanceModule } from '../finance/finance.module';
import { PaymentFiatModule } from '../payment-fiat/payment-fiat.module';
import { PaymentCryptoModule } from '../payment-crypto/payment-crypto.module';
import { CheckPendingOrdersJob } from './check-pending-orders.job';
import { GasMonitorJob } from './gas-monitor.job';
import { LiquidityManagerJob } from './liquidity-manager.job';
import { CheckPendingWithdrawalsJob } from './check-pending-withdrawals.job';
import { PrismaService } from '../../infra/database/prisma.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        FinanceModule,
        PaymentFiatModule,
        PaymentCryptoModule,
    ],
    providers: [
        CheckPendingOrdersJob,
        GasMonitorJob,
        LiquidityManagerJob,
        CheckPendingWithdrawalsJob,
        PrismaService,
    ],
})
export class JobsModule { }
