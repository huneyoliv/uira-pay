"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateExchangeUseCase = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = __importDefault(require("decimal.js"));
let CalculateExchangeUseCase = class CalculateExchangeUseCase {
    FEE_PERCENTAGE = new decimal_js_1.default(0.035);
    SPREAD_PERCENTAGE = new decimal_js_1.default(0.015);
    execute(fiatAmount, exchangeRate) {
        const amount = new decimal_js_1.default(fiatAmount);
        const rate = new decimal_js_1.default(exchangeRate);
        if (amount.isNegative() || amount.isZero()) {
            throw new Error('Amount must be positive');
        }
        const totalFeeBrl = amount.times(this.FEE_PERCENTAGE);
        const netFiatAmount = amount.minus(totalFeeBrl);
        const rateWithSpread = rate.times(new decimal_js_1.default(1).plus(this.SPREAD_PERCENTAGE));
        const netCryptoAmount = netFiatAmount.dividedBy(rateWithSpread);
        return {
            netCryptoAmount,
            totalFeeBrl,
            exchangeRate: rate,
        };
    }
};
exports.CalculateExchangeUseCase = CalculateExchangeUseCase;
exports.CalculateExchangeUseCase = CalculateExchangeUseCase = __decorate([
    (0, common_1.Injectable)()
], CalculateExchangeUseCase);
//# sourceMappingURL=calculate-exchange.usecase.js.map