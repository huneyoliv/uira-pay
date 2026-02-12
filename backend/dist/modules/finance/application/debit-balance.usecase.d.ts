import Decimal from 'decimal.js';
import { IWalletRepository } from '../domain/wallet.repository.interface';
import { Wallet } from '../domain/wallet.entity';
export declare class DebitBalanceUseCase {
    private readonly walletRepository;
    constructor(walletRepository: IWalletRepository);
    execute(tenantId: string, amount: Decimal | number | string): Promise<Wallet>;
}
