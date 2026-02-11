import { Module, forwardRef } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module';
import { BinanceProvider } from './infra/binance.provider';
import { WithdrawUseCase } from './application/withdraw.usecase';
import { WithdrawController } from './controllers/withdraw.controller';

@Module({
    imports: [forwardRef(() => FinanceModule)],
    controllers: [WithdrawController],
    providers: [BinanceProvider, WithdrawUseCase],
    exports: [WithdrawUseCase, BinanceProvider],
})
export class PaymentCryptoModule { }
