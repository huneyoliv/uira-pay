import { Wallet } from './wallet.entity';

export abstract class IWalletRepository {
    abstract findByTenantId(tenantId: string): Promise<Wallet | null>;
    abstract save(wallet: Wallet): Promise<void>;
    abstract create(wallet: Wallet): Promise<void>;
    abstract addTransaction(walletId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE', status: 'COMPLETED' | 'PENDING' | 'FAILED'): Promise<void>;
}
