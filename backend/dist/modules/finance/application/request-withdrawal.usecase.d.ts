import { PrismaService } from '../../../infra/database/prisma.service';
import { CryptoFeeService } from '../providers/crypto-fee.service';
import { WithdrawService } from '../services/withdraw.service';
import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';
interface RequestWithdrawalDto {
    tenantId: string;
    amount: number;
    network: string;
    address: string;
}
export declare class RequestWithdrawalUseCase {
    private readonly prisma;
    private readonly cryptoFeeService;
    private readonly withdrawService;
    private readonly binanceProvider;
    private readonly logger;
    constructor(prisma: PrismaService, cryptoFeeService: CryptoFeeService, withdrawService: WithdrawService, binanceProvider: BinanceProvider);
    execute(dto: RequestWithdrawalDto & {
        save_wallet?: boolean;
        nickname?: string;
    }): Promise<{
        transaction: {
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            created_at: Date;
            amount: number;
            fee: number;
            tx_hash: string | null;
            status: import(".prisma/client").$Enums.TransactionStatus;
            wallet_id: string;
        };
        updatedWallet: {
            id: string;
            currency: import(".prisma/client").$Enums.Currency;
            balance: number;
            updated_at: Date;
            tenant_id: string;
        };
        status: string;
        txHash: string;
    }>;
}
export {};
