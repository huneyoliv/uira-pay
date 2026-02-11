import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICryptoGateway } from '../domain/crypto-gateway.interface';
import Decimal from 'decimal.js';
// @ts-ignore
import * as ccxt from 'ccxt';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BinanceProvider implements ICryptoGateway {
    private exchange: ccxt.Exchange;

    private readonly isConfigured: boolean;
    private readonly apiKey: string;
    private readonly secretKey: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('BINANCE_API_KEY') || '';
        this.secretKey = this.configService.get<string>('BINANCE_SECRET_KEY') || '';

        this.isConfigured = !!(this.apiKey && this.secretKey && this.apiKey !== 'sua-api-key' && this.secretKey !== 'sua-secret-key');

        const isTestnet = this.configService.get<string>('BINANCE_TESTNET') === 'true';
        this.baseUrl = isTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';

        if (this.isConfigured) {
            this.exchange = new ccxt.binance({
                apiKey: this.apiKey,
                secret: this.secretKey,
                enableRateLimit: true,
                timeout: 30000,
                options: {
                    defaultType: 'spot',
                },
            });

            if (isTestnet) {
                this.exchange.setSandboxMode(true);
                console.log('BinanceProvider: Running in TESTNET mode.');
            }
        } else {
            console.warn('BinanceProvider: API keys are missing or placeholders. Binance integration will be disabled.');
        }
    }

    async getSpotPrice(pair: string): Promise<Decimal> {
        if (!this.isConfigured) {
            throw new Error('Binance not configured');
        }
        try {
            const ticker = await this.exchange.fetchTicker(pair);
            if (!ticker || !ticker.last) {
                throw new Error('Price not found');
            }
            return new Decimal(ticker.last);
        } catch (error) {
            console.error(`Error fetching spot price for ${pair}:`, error);
            throw new InternalServerErrorException('Failed to fetch spot price');
        }
    }

    async getBalance(): Promise<Decimal> {
        if (!this.isConfigured) return new Decimal(0);
        try {
            const balance = await this.exchange.fetchBalance();
            const usdt = balance['USDT'];
            return new Decimal(usdt ? usdt.free : 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
            return new Decimal(0);
        }
    }

    async getAccountBalance(asset: string): Promise<number> {
        if (!this.isConfigured) return 0;
        try {
            const balance = await this.exchange.fetchBalance();
            const assetBalance = balance[asset];
            return assetBalance ? assetBalance.free : 0;
        } catch (error: any) {
            console.error(`Error fetching balance for ${asset}:`, error);
            throw new InternalServerErrorException(`Failed to fetch balance for ${asset}`);
        }
    }

    async createMarketBuyOrder(pair: string, quoteAmount: number): Promise<any> {
        if (!this.isConfigured) {
            throw new Error('Binance not configured');
        }
        try {
            console.log(`Creating Market Buy Order: ${pair}, Quote Amount (BRL): ${quoteAmount}`);

            const params = {
                quoteOrderQty: quoteAmount,
            };

            const order = await this.exchange.createOrder(pair, 'market', 'buy', undefined, undefined, params);
            return order;
        } catch (error: any) {
            console.error(`Error creating market buy order for ${pair}:`, error);
            throw new InternalServerErrorException(`Failed to create market buy order: ${error.message}`);
        }
    }

    async withdraw(address: string, amount: Decimal, network: string, transactionId: string, coin: string = 'USDT'): Promise<string> {
        if (network !== 'BINANCE_INTERNAL') {
            this.validateAddress(address, network);
        }

        const binanceNetwork = this.mapNetwork(network);

        try {
            if (!this.isConfigured) {
                throw new Error('Binance not configured');
            }
            console.log(`Withdrawing ${amount.toString()} ${coin} to ${address} on ${binanceNetwork} (TxId: ${transactionId})`);

            // SECURITY: Pass internal Transaction ID as withdrawOrderId to enforce Idempotency.
            return await this.withdrawSigned(coin, address, amount.toNumber(), binanceNetwork, transactionId);

        } catch (error: any) {
            console.error('Binance withdrawal error:', error);
            const errorMessage = error.response?.data?.msg || error.message || 'Unknown Error';

            // Critical Error Handling
            if (errorMessage.includes('judge withdraw check fail')) {
                throw new BadRequestException(`Binance Security Block: ${errorMessage}`);
            }
            if (errorMessage.includes('Insufficient funds')) {
                throw new BadRequestException(`Binance Error: Insufficient funds (System Wallet). Details: ${errorMessage}`);
            }
            if (errorMessage.includes('Invalid address') || errorMessage.includes('illegal')) {
                throw new BadRequestException(`Binance Error: Invalid address or email. Details: ${errorMessage}`);
            }
            throw new BadRequestException(`Binance Error: ${errorMessage}`);
        }
    }

    /**
     * Executes a withdrawal using a manual Signed Request to enforce Idempotency.
     * @param withdrawOrderId - MUST be the Internal Transaction UUID (Audit Requirement)
     */
    private async withdrawSigned(coin: string, address: string, amount: number, network: string, withdrawOrderId: string): Promise<string> {
        const endpoint = '/sapi/v1/capital/withdraw/apply';
        const timestamp = Date.now();

        // COMPLIANCE: We use the existing Transaction ID, ensuring that retries 
        // with the same ID will be rejected by Binance if already processed.

        const params: any = {
            coin: coin,
            address: address,
            amount: amount.toString(),
            timestamp: timestamp.toString(),
            withdrawOrderId: withdrawOrderId, // Hard link to internal DB
            recvWindow: '5000' // Protection against Replay Attacks (Standard)
        };

        if (network) {
            params.network = network;
        }

        // Sort keys to ensure consistent signature (Binance Requirement)
        // Although URLSearchParams doesn't strictly sort, keeping order in mind is good practice.
        // We use queryParams string directly for signing.
        const queryParams = new URLSearchParams(params);
        params.signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(queryParams.toString())
            .digest('hex');

        // Append signature to query params
        queryParams.append('signature', params.signature);

        const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;

        try {
            const response = await axios.post(url, null, {
                headers: {
                    'X-MBX-APIKEY': this.apiKey,
                },
            });

            return response.data.id;
        } catch (error: any) {
            console.error('Binance Signed Request Failed:', error.response?.data || error.message);
            throw error;
        }
    }

    private mapNetwork(network: string): string {
        switch (network) {
            case 'POLYGON': return 'MATIC';
            case 'TRON': return 'TRX';
            case 'BINANCE_INTERNAL': return ''; // Internal transfer might behave differently or be auto-detected
            default: return network; // Try passing as is if not mapped
        }
    }

    private validateAddress(address: string, network: string): void {
        // Simple regex validation
        if (network === 'POLYGON') {
            if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
                throw new BadRequestException('Invalid Polygon address');
            }
        } else if (network === 'TRON') {
            if (!/^T[a-zA-Z0-9]{33}$/.test(address)) {
                throw new BadRequestException('Invalid Tron address');
            }
        }
    }

    async getWithdrawalFees(): Promise<any> {
        if (!this.isConfigured) return {};
        try {
            const currencies = await this.exchange.fetchCurrencies();
            return currencies;
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    async getWithdrawalStatus(withdrawalId: string, coin: string = 'USDT'): Promise<{ status: string; txHash?: string }> {
        if (!this.isConfigured) return { status: 'UNKNOWN' };
        try {
            const withdrawals = await this.exchange.fetchWithdrawals(coin, undefined, 50);
            const withdrawal = withdrawals.find((w: any) => w.id === withdrawalId);

            if (!withdrawal) {
                return { status: 'PENDING' };
            }
            if (withdrawal.status === 'ok') {
                return { status: 'COMPLETED', txHash: withdrawal.txid };
            } else if (withdrawal.status === 'failed' || withdrawal.status === 'canceled') {
                return { status: 'FAILED' };
            }
            return { status: 'PENDING' };
        } catch (error) {
            return { status: 'UNKNOWN' };
        }
    }

    /**
     * Get balances for multiple assets at once.
     */
    async getMultiBalance(): Promise<{ USDT: number; USDC: number; BRL: number }> {
        if (!this.isConfigured) return { USDT: 0, USDC: 0, BRL: 0 };
        try {
            const balance = await this.exchange.fetchBalance();
            return {
                USDT: balance['USDT']?.free || 0,
                USDC: balance['USDC']?.free || 0,
                BRL: balance['BRL']?.free || 0,
            };
        } catch (error) {
            console.error('Error fetching multi-balance:', error);
            return { USDT: 0, USDC: 0, BRL: 0 };
        }
    }

    /**
     * Rebalance between stablecoins (e.g., convert USDT→USDC or USDC→USDT).
     */
    async rebalance(from: 'USDT' | 'USDC', to: 'USDT' | 'USDC', amount: number): Promise<any> {
        if (!this.isConfigured) throw new Error('Binance not configured');
        if (from === to) return null;

        try {
            // USDC/USDT pair: buy USDC with USDT or sell USDC for USDT
            const pair = 'USDC/USDT';
            const side = from === 'USDT' ? 'buy' : 'sell';

            console.log(`Rebalancing: ${side} ${pair}, amount: ${amount} ${from}`);

            const params = side === 'buy'
                ? { quoteOrderQty: amount }  // Spend X USDT to buy USDC
                : {};                         // Sell X USDC for USDT

            const baseAmount = side === 'sell' ? amount : undefined;

            const order = await this.exchange.createOrder(pair, 'market', side, baseAmount, undefined, params);
            console.log(`Rebalance complete: ${JSON.stringify({ filled: order.filled, cost: order.cost, status: order.status })}`);
            return order;
        } catch (error: any) {
            console.error(`Rebalance error (${from}→${to}):`, error.message);
            throw new InternalServerErrorException(`Failed to rebalance ${from}→${to}: ${error.message}`);
        }
    }
}
