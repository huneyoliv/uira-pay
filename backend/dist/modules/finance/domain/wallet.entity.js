"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
class Wallet {
    id;
    tenantId;
    currency;
    balance;
    updatedAt;
    constructor(id, tenantId, currency, balance, updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.currency = currency;
        this.balance = balance;
        this.updatedAt = updatedAt;
    }
    credit(amount) {
        const creditAmount = new decimal_js_1.default(amount);
        if (creditAmount.isNegative() || creditAmount.isZero()) {
            throw new Error('Amount must be positive');
        }
        this.balance = this.balance.plus(creditAmount);
        this.updatedAt = new Date();
    }
    debit(amount) {
        const debitAmount = new decimal_js_1.default(amount);
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
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.entity.js.map