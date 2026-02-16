import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { PrismaWalletRepository } from './infra/database/prisma-wallet.repository';
import { IWalletRepository } from './domain/wallet.repository.interface';
import { CreditBalanceUseCase } from './application/credit-balance.usecase';
import { CalculateExchangeUseCase } from './application/calculate-exchange.usecase';
import { DebitBalanceUseCase } from './application/debit-balance.usecase';
import { CreateTransactionUseCase } from './application/create-transaction.usecase';
import { ReplenishLiquidityUseCase } from './application/replenish-liquidity.usecase';
import { AutoConvertBalanceUseCase } from './application/auto-convert-balance.usecase';

import { TenantController } from './controllers/tenant.controller';
import { PaymentFiatModule } from '../payment-fiat/payment-fiat.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentCryptoModule } from '../payment-crypto/payment-crypto.module';
import { BcbService } from './providers/bcb.service';

import { WithdrawalController } from './controllers/withdrawal.controller';
import { CryptoFeeService } from './providers/crypto-fee.service';
import { RequestWithdrawalUseCase } from './application/request-withdrawal.usecase';
import { WalletController } from './controllers/wallet.controller';
import { WithdrawService } from './services/withdraw.service';
import { AuthModule } from '../identity/auth/auth.module';

@Module({
    imports: [
        forwardRef(() => PaymentFiatModule),
        ConfigModule,
        forwardRef(() => PaymentCryptoModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [TenantController, WithdrawalController, WalletController],
    providers: [
        PrismaService,
        CreditBalanceUseCase,
        CalculateExchangeUseCase,
        DebitBalanceUseCase,
        CreateTransactionUseCase,
        ReplenishLiquidityUseCase,
        AutoConvertBalanceUseCase,
        RequestWithdrawalUseCase,
        {
            provide: IWalletRepository,
            useClass: PrismaWalletRepository,
        },
        BcbService,
        CryptoFeeService,
        WithdrawService,
    ],
    exports: [
        CreditBalanceUseCase,
        CalculateExchangeUseCase,
        DebitBalanceUseCase,
        CreateTransactionUseCase,
        ReplenishLiquidityUseCase,
        AutoConvertBalanceUseCase,
        RequestWithdrawalUseCase,
        IWalletRepository,
        BcbService,
        CryptoFeeService,
        WithdrawService,
    ],
})
export class FinanceModule { }
