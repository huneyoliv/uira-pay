import { CryptoFeeService } from '../providers/crypto-fee.service';
import { RequestWithdrawalUseCase } from '../application/request-withdrawal.usecase';
import { RequestWithdrawalDto } from '../dtos/request-withdrawal.dto';
import { PrismaService } from '../../../infra/database/prisma.service';
import { Validate2FAUseCase } from '../../identity/auth/application/totp/validate-2fa.usecase';
export declare class WithdrawalController {
    private readonly cryptoFeeService;
    private readonly requestWithdrawalUseCase;
    private readonly prisma;
    private readonly validate2FAUseCase;
    constructor(cryptoFeeService: CryptoFeeService, requestWithdrawalUseCase: RequestWithdrawalUseCase, prisma: PrismaService, validate2FAUseCase: Validate2FAUseCase);
    getFees(req: any): Promise<import("../providers/crypto-fee.service").NetworkFee[]>;
    requestWithdrawal(req: any, body: RequestWithdrawalDto): Promise<{
        transaction: {
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
    } | {
        requiresTwoFactor: boolean;
        message: string;
    }>;
}
