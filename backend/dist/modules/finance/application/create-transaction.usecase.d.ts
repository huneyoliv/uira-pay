import { PrismaService } from '../../../infra/database/prisma.service';
import Decimal from 'decimal.js';
export interface CreateTransactionInput {
    walletId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE';
    amount: Decimal | number | string;
    fee: Decimal | number | string;
    txHash?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
}
export declare class CreateTransactionUseCase {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(input: CreateTransactionInput): Promise<void>;
}
