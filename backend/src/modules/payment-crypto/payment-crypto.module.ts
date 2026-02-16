import { Module, forwardRef } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module';
import { BinanceProvider } from './infra/binance.provider';
import { WithdrawUseCase } from './application/withdraw.usecase';

@Module({
    imports: [forwardRef(() => FinanceModule)],
    controllers: [],
    providers: [BinanceProvider, WithdrawUseCase],
    exports: [WithdrawUseCase, BinanceProvider],
})
export class PaymentCryptoModule { }

