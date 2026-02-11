import Decimal from 'decimal.js';

export class Wallet {
    constructor(
        public id: string,
        public tenantId: string,
        public currency: string, // Keeping as string to avoid coupling with Prisma Enum in domain, or could use shared Enum
        public balance: Decimal,
        public updatedAt: Date,
    ) { }

    credit(amount: Decimal | number | string): void {
        const creditAmount = new Decimal(amount);
        if (creditAmount.isNegative() || creditAmount.isZero()) {
            throw new Error('Amount must be positive');
        }
        this.balance = this.balance.plus(creditAmount);
        this.updatedAt = new Date();
    }

    debit(amount: Decimal | number | string): void {
        const debitAmount = new Decimal(amount);
        if (debitAmount.isNegative() || debitAmount.isZero()) {
            throw new Error('Amount must be positive');
        }
        if (this.balance.lessThan(debitAmount)) {
            throw new Error('Insufficient balance');
        }
        this.balance = this.balance.minus(debitAmount);
        this.updatedAt = new Date();
    }
}
