import { BinanceProvider } from '../payment-crypto/infra/binance.provider';
export declare class GasMonitorJob {
    private readonly binanceProvider;
    private readonly logger;
    private readonly MIN_RESERVE;
    constructor(binanceProvider: BinanceProvider);
    handleCron(): Promise<void>;
}
