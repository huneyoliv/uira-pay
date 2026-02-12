import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';
export interface NetworkFee {
    network: string;
    fee: number;
    currency: string;
    displayName: string;
}
export declare class CryptoFeeService {
    private readonly binanceProvider;
    private readonly logger;
    private feesCache;
    private lastFetchTime;
    private readonly CACHE_TTL;
    private readonly FALLBACK_FEES;
    constructor(binanceProvider: BinanceProvider);
    getAvailableNetworks(currency: string): Promise<NetworkFee[]>;
    getFee(currency: string, network: string): Promise<number>;
    withdraw(address: string, amount: number, network: string, transactionId: string, coin?: string): Promise<string>;
    private refreshFeesIfNeeded;
    private mapBinanceNetworks;
    private getDisplayName;
}
