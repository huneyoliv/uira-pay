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
var ReplenishLiquidityUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplenishLiquidityUseCase = void 0;
const common_1 = require("@nestjs/common");
const efi_gateway_provider_1 = require("../../payment-fiat/providers/efi-gateway.provider");
let ReplenishLiquidityUseCase = ReplenishLiquidityUseCase_1 = class ReplenishLiquidityUseCase {
    efiGatewayProvider;
    logger = new common_1.Logger(ReplenishLiquidityUseCase_1.name);
    constructor(efiGatewayProvider) {
        this.efiGatewayProvider = efiGatewayProvider;
    }
    async execute(pixCode, description) {
        this.logger.log(`Replenishing liquidity via Pix Code. Description: ${description || 'N/A'}`);
        const result = await this.efiGatewayProvider.payPixCode(pixCode);
        this.logger.log('Liquidity replenishment payment executed successfully.');
        return result;
    }
};
exports.ReplenishLiquidityUseCase = ReplenishLiquidityUseCase;
exports.ReplenishLiquidityUseCase = ReplenishLiquidityUseCase = ReplenishLiquidityUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [efi_gateway_provider_1.EfiGatewayProvider])
], ReplenishLiquidityUseCase);
//# sourceMappingURL=replenish-liquidity.usecase.js.map