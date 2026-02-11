import { ConfigService } from '@nestjs/config';
import { AutoConvertBalanceUseCase } from '../finance/application/auto-convert-balance.usecase';
import { BinanceProvider } from '../payment-crypto/infra/binance.provider';
import { EfiGatewayProvider } from '../payment-fiat/providers/efi-gateway.provider';
export declare class LiquidityManagerJob {
    private readonly autoConvertBalanceUseCase;
    private readonly binanceProvider;
    private readonly efiGatewayProvider;
    private readonly configService;
    private readonly logger;
    private failureCount;
    private readonly MAX_FAILURES;
    private readonly MIN_RESERVE;
    private readonly REBALANCE_THRESHOLD;
    private readonly MAX_REPLENISH_AMOUNT;
    private readonly MIN_EFI_RESERVE;
    private readonly REPLENISH_COOLDOWN_MS;
    private lastReplenishTime;
    constructor(autoConvertBalanceUseCase: AutoConvertBalanceUseCase, binanceProvider: BinanceProvider, efiGatewayProvider: EfiGatewayProvider, configService: ConfigService);
    handleCron(): Promise<void>;
    private checkAndRebalance;
    private checkAndReplenish;
}
