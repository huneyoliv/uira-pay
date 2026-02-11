import { Injectable, Logger } from '@nestjs/common';
import { BinanceProvider } from '../../payment-crypto/infra/binance.provider';
import Decimal from 'decimal.js';

export interface NetworkFee {
    network: string;
    fee: number;
    currency: string;
    displayName: string;
}

@Injectable()
export class CryptoFeeService {
    private readonly logger = new Logger(CryptoFeeService.name);
    private feesCache: Record<string, NetworkFee[]> = {};
    private lastFetchTime: number = 0;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Fallback fees in case Binance API fails
    private readonly FALLBACK_FEES: Record<string, NetworkFee[]> = {
        'USDT': [
            { network: 'BSC', fee: 0.01, currency: 'USDT', displayName: 'BNB Smart Chain (BEP20)' },
            { network: 'MATIC', fee: 1.0, currency: 'USDT', displayName: 'Polygon (MATIC)' },
            { network: 'SOL', fee: 1.0, currency: 'USDT', displayName: 'Solana' },
        ],
        'USDC': [
            { network: 'BSC', fee: 0.01, currency: 'USDC', displayName: 'BNB Smart Chain (BEP20)' },
            { network: 'MATIC', fee: 1.0, currency: 'USDC', displayName: 'Polygon (MATIC)' },
            { network: 'SOL', fee: 1.0, currency: 'USDC', displayName: 'Solana' },
        ]
    };

    constructor(private readonly binanceProvider: BinanceProvider) { }

    async getAvailableNetworks(currency: string): Promise<NetworkFee[]> {
        await this.refreshFeesIfNeeded();
        return this.feesCache[currency] || this.FALLBACK_FEES[currency] || [];
    }

    async getFee(currency: string, network: string): Promise<number> {
        const networks = await this.getAvailableNetworks(currency);
        const networkFee = networks.find(n => n.network === network);

        if (!networkFee) {
            // Try fallback if not found in cache (maybe cache is empty/failed)
            const fallbackNetworks = this.FALLBACK_FEES[currency] || [];
            const fallbackFee = fallbackNetworks.find(n => n.network === network);
            if (fallbackFee) return fallbackFee.fee;

            throw new Error(`Network ${network} not supported for ${currency}`);
        }

        return networkFee.fee;
    }

    async withdraw(address: string, amount: number, network: string, transactionId: string, coin: string = 'USDT'): Promise<string> {
        return this.binanceProvider.withdraw(address, new Decimal(amount), network, transactionId, coin);
    }

    private async refreshFeesIfNeeded() {
        const now = Date.now();
        if (now - this.lastFetchTime < this.CACHE_TTL && Object.keys(this.feesCache).length > 0) {
            return; // Cache valid
        }

        try {
            this.logger.log('Fetching dynamic withdrawal fees from Binance...');
            const currencies: any = await this.binanceProvider.getWithdrawalFees();

            if (!currencies || Object.keys(currencies).length === 0) {
                this.logger.warn('Received empty currencies from Binance, using fallback/cache.');
                return;
            }

            const newCache: Record<string, NetworkFee[]> = {};

            // Process USDT
            if (currencies['USDT']) {
                newCache['USDT'] = this.mapBinanceNetworks(currencies['USDT'], 'USDT');
            }
            // Process USDC
            if (currencies['USDC']) {
                newCache['USDC'] = this.mapBinanceNetworks(currencies['USDC'], 'USDC');
            }

            this.feesCache = newCache;
            this.lastFetchTime = now;
            this.logger.log('Withdrawal fees updated successfully.');
        } catch (error) {
            this.logger.error('Failed to update withdrawal fees from Binance', error);
            // Keep old cache or fallback
        }
    }

    private mapBinanceNetworks(currencyInfo: any, currencyCode: string): NetworkFee[] {
        const networks: NetworkFee[] = [];
        // ccxt structure: currencyInfo.networks is usually an array or object
        // If fetchCurrencies returns a dictionary indexed by code, currencyInfo is the value.
        // currencyInfo.networks might be undefined if not supported by exchange or ccxt version.
        // For Binance, ccxt usually populates 'networks' property.

        if (currencyInfo.networks) {
            for (const netKey in currencyInfo.networks) {
                const net = currencyInfo.networks[netKey];
                // Filter for networks we want to support explicitly to avoid confusing user with 20 options
                // Supported: BSC (BEP20), MATIC, SOL
                // Binance network codes: BSC, MATIC, SOL

                if (['BSC', 'MATIC', 'SOL'].includes(net.id)) { // net.id is usually the network code
                    networks.push({
                        network: net.id,
                        fee: net.fee,
                        currency: currencyCode,
                        displayName: this.getDisplayName(net.id)
                    });
                }
            }
        }
        return networks;
    }

    private getDisplayName(networkCode: string): string {
        switch (networkCode) {
            case 'BSC': return 'BNB Smart Chain (BEP20)';
            case 'MATIC': return 'Polygon (MATIC)';
            case 'SOL': return 'Solana';
            default: return networkCode;
        }
    }
}
