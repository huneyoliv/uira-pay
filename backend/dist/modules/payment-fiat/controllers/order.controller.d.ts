import { CreateOrderDto } from '../dtos/create-order.dto';
import { CalculateExchangeUseCase } from '../../finance/application/calculate-exchange.usecase';
import { EfiGatewayProvider } from '../providers/efi-gateway.provider';
import { BcbService } from '../../finance/providers/bcb.service';
import { PrismaService } from '../../../infra/database/prisma.service';
export declare class OrderController {
    private readonly calculateExchangeUseCase;
    private readonly efiGatewayProvider;
    private readonly prisma;
    private readonly bcbService;
    constructor(calculateExchangeUseCase: CalculateExchangeUseCase, efiGatewayProvider: EfiGatewayProvider, prisma: PrismaService, bcbService: BcbService);
    createOrder(body: CreateOrderDto, user: any): Promise<{
        id: string;
        pixCode: string;
        txid: string;
        exchangeRate: import("decimal.js").Decimal;
        netCryptoAmount: import("decimal.js").Decimal;
        totalFeeBrl: import("decimal.js").Decimal;
        originalAmount: number;
        originalCurrency: string;
        conversionRate: number;
    }>;
    getOrder(id: string, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        created_at: Date;
        tenant_id: string;
        txid: string | null;
        fiat_amount: number;
        crypto_amount_est: number;
        conversion_status: import(".prisma/client").$Enums.ConversionStatus;
        pix_code: string;
        payerName: string | null;
        payerDocument: string | null;
    }>;
}
