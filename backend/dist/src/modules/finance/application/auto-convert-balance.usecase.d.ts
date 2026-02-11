import { PrismaService } from '../../../infra/database/prisma.service';
import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';
import { CreateTransactionUseCase } from './create-transaction.usecase';
export declare class AutoConvertBalanceUseCase {
    private readonly prisma;
    private readonly binanceProvider;
    private readonly createTransactionUseCase;
    private readonly logger;
    constructor(prisma: PrismaService, binanceProvider: BinanceProvider, createTransactionUseCase: CreateTransactionUseCase);
    execute(): Promise<void>;
}
