import { IWalletRepository } from '../../domain/wallet.repository.interface';
import { Wallet } from '../../domain/wallet.entity';
import { PrismaService } from '../../../../infra/database/prisma.service';
export declare class PrismaWalletRepository implements IWalletRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByTenantId(tenantId: string): Promise<Wallet | null>;
    save(wallet: Wallet): Promise<void>;
    create(wallet: Wallet): Promise<void>;
    addTransaction(walletId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE', status: 'COMPLETED' | 'PENDING' | 'FAILED'): Promise<void>;
}
