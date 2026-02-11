"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditBalanceUseCase = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = __importDefault(require("decimal.js"));
const wallet_repository_interface_1 = require("../domain/wallet.repository.interface");
const wallet_entity_1 = require("../domain/wallet.entity");
let CreditBalanceUseCase = class CreditBalanceUseCase {
    walletRepository;
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async execute(tenantId, cryptoAmount) {
        let wallet = await this.walletRepository.findByTenantId(tenantId);
        if (!wallet) {
            wallet = new wallet_entity_1.Wallet(crypto.randomUUID(), tenantId, 'USDT', new decimal_js_1.default(0), new Date());
        }
        wallet.credit(cryptoAmount);
        if (await this.walletRepository.findByTenantId(tenantId)) {
            await this.walletRepository.save(wallet);
        }
        else {
            await this.walletRepository.create(wallet);
        }
        await this.walletRepository.addTransaction(wallet.id, Number(cryptoAmount), 'DEPOSIT', 'COMPLETED');
        return wallet;
    }
};
exports.CreditBalanceUseCase = CreditBalanceUseCase;
exports.CreditBalanceUseCase = CreditBalanceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_interface_1.IWalletRepository])
], CreditBalanceUseCase);
//# sourceMappingURL=credit-balance.usecase.js.map