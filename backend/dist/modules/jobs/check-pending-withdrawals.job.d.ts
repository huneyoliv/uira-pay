import { PrismaService } from '../../infra/database/prisma.service';
import { BinanceProvider } from '../payment-crypto/infra/binance.provider';
export declare class CheckPendingWithdrawalsJob {
    private readonly prisma;
    private readonly binanceProvider;
    private readonly logger;
    constructor(prisma: PrismaService, binanceProvider: BinanceProvider);
    handleCron(): Promise<void>;
}
