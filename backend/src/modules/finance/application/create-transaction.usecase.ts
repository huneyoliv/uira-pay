import { Injectable } from '@nestjs/common';
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

@Injectable()
export class CreateTransactionUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: CreateTransactionInput): Promise<void> {
        await this.prisma.transaction.create({
            data: {
                wallet_id: input.walletId,
                type: input.type,
                amount: new Decimal(input.amount).toNumber(),
                fee: new Decimal(input.fee).toNumber(),
                tx_hash: input.txHash,
                status: input.status,
            },
        });
    }
}
