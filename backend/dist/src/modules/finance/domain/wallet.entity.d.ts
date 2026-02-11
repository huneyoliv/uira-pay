import Decimal from 'decimal.js';
export declare class Wallet {
    id: string;
    tenantId: string;
    currency: string;
    balance: Decimal;
    updatedAt: Date;
    constructor(id: string, tenantId: string, currency: string, balance: Decimal, updatedAt: Date);
    credit(amount: Decimal | number | string): void;
    debit(amount: Decimal | number | string): void;
}
