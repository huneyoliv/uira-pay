import { PrismaService } from '../../../infra/database/prisma.service';
import { Wallet, Transaction } from '@prisma/client';
export declare class WithdrawService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(walletId: string, totalDeduction: number, actualWithdrawalAmount: number, fee: number, network: string, txHash?: string | null): Promise<{
        updatedWallet: Wallet;
        transaction: Transaction;
    }>;
}
