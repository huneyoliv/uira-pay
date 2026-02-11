import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import * as crypto from 'crypto';
import { DebitBalanceUseCase } from '../../finance/application/debit-balance.usecase';
import { CreateTransactionUseCase } from '../../finance/application/create-transaction.usecase';
import { BinanceProvider } from '../infra/binance.provider';

@Injectable()
export class WithdrawUseCase {
    constructor(
        private readonly debitBalanceUseCase: DebitBalanceUseCase,
        private readonly createTransactionUseCase: CreateTransactionUseCase,
        private readonly cryptoGateway: BinanceProvider, // Should inject interface, but for simplicity using provider class or use token
    ) { }

    async execute(tenantId: string, amount: Decimal | number | string, address: string, network: string): Promise<string> {
        const amountDecimal = new Decimal(amount);

        // 1. Debit Balance (Finance Module)
        // This ensures funds are locked/removed before sending to blockchain
        const wallet = await this.debitBalanceUseCase.execute(tenantId, amountDecimal);

        const transactionId = crypto.randomUUID();

        try {
            // 2. Call Gateway
            const txHash = await this.cryptoGateway.withdraw(address, amountDecimal, network, transactionId);

            // 3. Log Transaction (Finance Module)
            await this.createTransactionUseCase.execute({
                walletId: wallet.id,
                type: 'WITHDRAWAL',
                amount: amountDecimal,
                fee: new Decimal(0), // Mock fee
                txHash: txHash,
                status: 'COMPLETED', // Assuming instant success for mock
            });

            return txHash;
        } catch (error) {
            // Rollback logic would go here (credit back the amount)
            // For this step, we assume happy path or simple failure without complex rollback
            console.error('Withdrawal failed:', error);
            throw error;
        }
    }
}
