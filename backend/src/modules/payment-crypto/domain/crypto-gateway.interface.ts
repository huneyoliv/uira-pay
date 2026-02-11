import Decimal from 'decimal.js';

export interface ICryptoGateway {
    withdraw(address: string, amount: Decimal, network: string, transactionId: string): Promise<string>; // Returns txHash
    getBalance(): Promise<Decimal>;
    getSpotPrice(pair: string): Promise<Decimal>;
}
