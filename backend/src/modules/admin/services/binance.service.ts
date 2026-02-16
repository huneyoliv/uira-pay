import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BinanceService {
    private readonly logger = new Logger(BinanceService.name);
    private readonly baseUrl = 'https://api.binance.com';

    private getCredentials() {
        return {
            apiKey: process.env.BINANCE_API_KEY || '',
            secretKey: process.env.BINANCE_SECRET_KEY || '',
        };
    }

    private sign(queryString: string): string {
        const { secretKey } = this.getCredentials();
        return crypto
            .createHmac('sha256', secretKey)
            .update(queryString)
            .digest('hex');
    }

    async getBalances(): Promise<Array<{ asset: string; free: string; locked: string }>> {
        const { apiKey, secretKey } = this.getCredentials();
        if (!apiKey || !secretKey) {
            this.logger.warn('Binance credentials not configured');
            return [];
        }

        try {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = this.sign(queryString);

            const response = await axios.get(
                `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
                {
                    headers: {
                        'X-MBX-APIKEY': apiKey,
                    },
                },
            );

            // Filter only assets with non-zero balance
            const balances = response.data.balances
                .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
                .map((b: any) => ({
                    asset: b.asset,
                    free: b.free,
                    locked: b.locked,
                }));

            this.logger.log(`Binance balances fetched: ${balances.length} assets with balance`);
            return balances;
        } catch (error: any) {
            this.logger.error('Failed to fetch Binance balances', error.response?.data || error.message);
            return [];
        }
    }

    async getTotalUSDT(): Promise<number> {
        try {
            const balances = await this.getBalances();
            if (balances.length === 0) return 0;

            // Get USDT directly
            const usdtBalance = balances.find(b => b.asset === 'USDT');
            let total = usdtBalance ? parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked) : 0;

            // Convert other significant crypto to USDT (BTC, ETH, BNB)
            const significantAssets = balances.filter(b => ['BTC', 'ETH', 'BNB', 'SOL'].includes(b.asset));

            for (const asset of significantAssets) {
                try {
                    const priceResponse = await axios.get(
                        `${this.baseUrl}/api/v3/ticker/price?symbol=${asset.asset}USDT`,
                    );
                    const price = parseFloat(priceResponse.data.price);
                    const assetTotal = (parseFloat(asset.free) + parseFloat(asset.locked)) * price;
                    total += assetTotal;
                } catch {
                    // Skip failed price lookups
                }
            }

            return Math.round(total * 100) / 100;
        } catch (error: any) {
            this.logger.error('Failed to calculate total USDT', error.message);
            return 0;
        }
    }
}
