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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebitBalanceUseCase = void 0;
const common_1 = require("@nestjs/common");
const wallet_repository_interface_1 = require("../domain/wallet.repository.interface");
let DebitBalanceUseCase = class DebitBalanceUseCase {
    walletRepository;
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async execute(tenantId, amount) {
        const wallet = await this.walletRepository.findByTenantId(tenantId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        try {
            wallet.debit(amount);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
        await this.walletRepository.save(wallet);
        return wallet;
    }
};
exports.DebitBalanceUseCase = DebitBalanceUseCase;
exports.DebitBalanceUseCase = DebitBalanceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_interface_1.IWalletRepository])
], DebitBalanceUseCase);
//# sourceMappingURL=debit-balance.usecase.js.map