import { Wallet as PrismaWallet } from '@prisma/client';
import { Wallet } from '../../domain/wallet.entity';
export declare class WalletMapper {
    static toDomain(prismaWallet: PrismaWallet): Wallet;
    static toPersistence(wallet: Wallet): PrismaWallet;
}
