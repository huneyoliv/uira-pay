import { CreditBalanceUseCase } from '../../finance/application/credit-balance.usecase';
import { CalculateExchangeUseCase } from '../../finance/application/calculate-exchange.usecase';
import { PrismaService } from '../../../infra/database/prisma.service';
export declare class WebhookController {
    private readonly creditBalanceUseCase;
    private readonly calculateExchangeUseCase;
    private readonly prisma;
    constructor(creditBalanceUseCase: CreditBalanceUseCase, calculateExchangeUseCase: CalculateExchangeUseCase, prisma: PrismaService);
    handleWebhook(payload: any): Promise<{
        status: number;
    }>;
}
