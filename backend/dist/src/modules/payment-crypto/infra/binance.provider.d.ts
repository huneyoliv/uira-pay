import { ConfigService } from '@nestjs/config';
import { ICryptoGateway } from '../domain/crypto-gateway.interface';
import Decimal from 'decimal.js';
export declare class BinanceProvider implements ICryptoGateway {
    private readonly configService;
    private exchange;
    private readonly isConfigured;
    private readonly apiKey;
    private readonly secretKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    getSpotPrice(pair: string): Promise<Decimal>;
    getBalance(): Promise<Decimal>;
    getAccountBalance(asset: string): Promise<number>;
    createMarketBuyOrder(pair: string, quoteAmount: number): Promise<any>;
    withdraw(address: string, amount: Decimal, network: string, transactionId: string, coin?: string): Promise<string>;
    private withdrawSigned;
    private mapNetwork;
    private validateAddress;
    getWithdrawalFees(): Promise<any>;
    getWithdrawalStatus(withdrawalId: string, coin?: string): Promise<{
        status: string;
        txHash?: string;
    }>;
    getMultiBalance(): Promise<{
        USDT: number;
        USDC: number;
        BRL: number;
    }>;
    rebalance(from: 'USDT' | 'USDC', to: 'USDT' | 'USDC', amount: number): Promise<any>;
}
