import Decimal from 'decimal.js';
import { DebitBalanceUseCase } from '../../finance/application/debit-balance.usecase';
import { CreateTransactionUseCase } from '../../finance/application/create-transaction.usecase';
import { BinanceProvider } from '../infra/binance.provider';
export declare class WithdrawUseCase {
    private readonly debitBalanceUseCase;
    private readonly createTransactionUseCase;
    private readonly cryptoGateway;
    constructor(debitBalanceUseCase: DebitBalanceUseCase, createTransactionUseCase: CreateTransactionUseCase, cryptoGateway: BinanceProvider);
    execute(tenantId: string, amount: Decimal | number | string, address: string, network: string): Promise<string>;
}
