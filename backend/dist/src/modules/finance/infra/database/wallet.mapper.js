"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMapper = void 0;
const wallet_entity_1 = require("../../domain/wallet.entity");
const decimal_js_1 = __importDefault(require("decimal.js"));
class WalletMapper {
    static toDomain(prismaWallet) {
        return new wallet_entity_1.Wallet(prismaWallet.id, prismaWallet.tenant_id, prismaWallet.currency, new decimal_js_1.default(prismaWallet.balance), prismaWallet.updated_at);
    }
    static toPersistence(wallet) {
        return {
            id: wallet.id,
            tenant_id: wallet.tenantId,
            currency: wallet.currency,
            balance: wallet.balance.toNumber(),
            updated_at: wallet.updatedAt,
        };
    }
}
exports.WalletMapper = WalletMapper;
//# sourceMappingURL=wallet.mapper.js.map