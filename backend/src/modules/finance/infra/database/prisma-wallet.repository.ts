import { Injectable } from '@nestjs/common';
import { IWalletRepository } from '../../domain/wallet.repository.interface';
import { Wallet } from '../../domain/wallet.entity';
import { PrismaService } from '../../../../infra/database/prisma.service';
import { WalletMapper } from './wallet.mapper';

@Injectable()
export class PrismaWalletRepository implements IWalletRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByTenantId(tenantId: string): Promise<Wallet | null> {
        const prismaWallet = await this.prisma.wallet.findFirst({
            where: { tenant_id: tenantId },
        });

        if (!prismaWallet) {
            return null;
        }

        return WalletMapper.toDomain(prismaWallet);
    }

    async save(wallet: Wallet): Promise<void> {
        const data = WalletMapper.toPersistence(wallet);
        await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: data.balance,
                updated_at: data.updated_at,
            },
        });
    }

    async create(wallet: Wallet): Promise<void> {
        const data = WalletMapper.toPersistence(wallet);
        await this.prisma.wallet.create({
            data,
        });
    }

    async addTransaction(walletId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE', status: 'COMPLETED' | 'PENDING' | 'FAILED'): Promise<void> {
        await this.prisma.transaction.create({
            data: {
                wallet_id: walletId,
                amount: amount,
                type: type,
                status: status,
                fee: 0, // Default fee
            },
        });
    }
}
