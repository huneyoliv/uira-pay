import { PrismaService } from '../../infra/database/prisma.service';
import { EfiGatewayProvider } from '../payment-fiat/providers/efi-gateway.provider';
import { CreditBalanceUseCase } from '../finance/application/credit-balance.usecase';
export declare class CheckPendingOrdersJob {
    private readonly prisma;
    private readonly efiGatewayProvider;
    private readonly creditBalanceUseCase;
    private readonly logger;
    constructor(prisma: PrismaService, efiGatewayProvider: EfiGatewayProvider, creditBalanceUseCase: CreditBalanceUseCase);
    handleCron(): Promise<void>;
}
