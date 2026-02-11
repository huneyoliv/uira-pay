import { CryptoFeeService } from '../providers/crypto-fee.service';
import { RequestWithdrawalUseCase } from '../application/request-withdrawal.usecase';
import { PrismaService } from '../../../infra/database/prisma.service';
export declare class WithdrawalController {
    private readonly cryptoFeeService;
    private readonly requestWithdrawalUseCase;
    private readonly prisma;
    constructor(cryptoFeeService: CryptoFeeService, requestWithdrawalUseCase: RequestWithdrawalUseCase, prisma: PrismaService);
    getFees(req: any): Promise<import("../providers/crypto-fee.service").NetworkFee[]>;
    requestWithdrawal(req: any, body: {
        amount: number;
        network: string;
        address: string;
        save_wallet?: boolean;
        nickname?: string;
    }): Promise<{
        transaction: {
            status: import(".prisma/client").$Enums.TransactionStatus;
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            created_at: Date;
            amount: number;
            fee: number;
            tx_hash: string | null;
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
