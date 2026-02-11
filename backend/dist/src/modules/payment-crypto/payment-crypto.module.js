"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCryptoModule = void 0;
const common_1 = require("@nestjs/common");
const finance_module_1 = require("../finance/finance.module");
const binance_provider_1 = require("./infra/binance.provider");
const withdraw_usecase_1 = require("./application/withdraw.usecase");
const withdraw_controller_1 = require("./controllers/withdraw.controller");
let PaymentCryptoModule = class PaymentCryptoModule {
};
exports.PaymentCryptoModule = PaymentCryptoModule;
exports.PaymentCryptoModule = PaymentCryptoModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => finance_module_1.FinanceModule)],
        controllers: [withdraw_controller_1.WithdrawController],
        providers: [binance_provider_1.BinanceProvider, withdraw_usecase_1.WithdrawUseCase],
        exports: [withdraw_usecase_1.WithdrawUseCase, binance_provider_1.BinanceProvider],
    })
], PaymentCryptoModule);
//# sourceMappingURL=payment-crypto.module.js.map