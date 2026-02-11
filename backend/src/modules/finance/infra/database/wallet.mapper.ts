import { Wallet as PrismaWallet } from '@prisma/client';
import { Wallet } from '../../domain/wallet.entity';
import Decimal from 'decimal.js';

export class WalletMapper {
    static toDomain(prismaWallet: PrismaWallet): Wallet {
        return new Wallet(
            prismaWallet.id,
            prismaWallet.tenant_id,
            prismaWallet.currency,
            new Decimal(prismaWallet.balance),
            prismaWallet.updated_at,
        );
    }

    static toPersistence(wallet: Wallet): PrismaWallet {
        return {
            id: wallet.id,
            tenant_id: wallet.tenantId,
            currency: wallet.currency as any, // Casting to any to avoid Enum issues for now, or import Enum from client
            balance: wallet.balance.toNumber(),
            updated_at: wallet.updatedAt,
        };
    }
}
