"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/database/prisma.service");
const prisma_wallet_repository_1 = require("./infra/database/prisma-wallet.repository");
const wallet_repository_interface_1 = require("./domain/wallet.repository.interface");
const credit_balance_usecase_1 = require("./application/credit-balance.usecase");
const calculate_exchange_usecase_1 = require("./application/calculate-exchange.usecase");
const debit_balance_usecase_1 = require("./application/debit-balance.usecase");
const create_transaction_usecase_1 = require("./application/create-transaction.usecase");
const replenish_liquidity_usecase_1 = require("./application/replenish-liquidity.usecase");
const auto_convert_balance_usecase_1 = require("./application/auto-convert-balance.usecase");
const tenant_controller_1 = require("./controllers/tenant.controller");
const payment_fiat_module_1 = require("../payment-fiat/payment-fiat.module");
const config_1 = require("@nestjs/config");
const payment_crypto_module_1 = require("../payment-crypto/payment-crypto.module");
const bcb_service_1 = require("./providers/bcb.service");
const withdrawal_controller_1 = require("./controllers/withdrawal.controller");
const crypto_fee_service_1 = require("./providers/crypto-fee.service");
const request_withdrawal_usecase_1 = require("./application/request-withdrawal.usecase");
const wallet_controller_1 = require("./controllers/wallet.controller");
const withdraw_service_1 = require("./services/withdraw.service");
const auth_module_1 = require("../identity/auth/auth.module");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => payment_fiat_module_1.PaymentFiatModule),
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => payment_crypto_module_1.PaymentCryptoModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [tenant_controller_1.TenantController, withdrawal_controller_1.WithdrawalController, wallet_controller_1.WalletController],
        providers: [
            prisma_service_1.PrismaService,
            credit_balance_usecase_1.CreditBalanceUseCase,
            calculate_exchange_usecase_1.CalculateExchangeUseCase,
            debit_balance_usecase_1.DebitBalanceUseCase,
            create_transaction_usecase_1.CreateTransactionUseCase,
            replenish_liquidity_usecase_1.ReplenishLiquidityUseCase,
            auto_convert_balance_usecase_1.AutoConvertBalanceUseCase,
            request_withdrawal_usecase_1.RequestWithdrawalUseCase,
            {
                provide: wallet_repository_interface_1.IWalletRepository,
                useClass: prisma_wallet_repository_1.PrismaWalletRepository,
            },
            bcb_service_1.BcbService,
            crypto_fee_service_1.CryptoFeeService,
            withdraw_service_1.WithdrawService,
        ],
        exports: [
            credit_balance_usecase_1.CreditBalanceUseCase,
            calculate_exchange_usecase_1.CalculateExchangeUseCase,
            debit_balance_usecase_1.DebitBalanceUseCase,
            create_transaction_usecase_1.CreateTransactionUseCase,
            replenish_liquidity_usecase_1.ReplenishLiquidityUseCase,
            auto_convert_balance_usecase_1.AutoConvertBalanceUseCase,
            request_withdrawal_usecase_1.RequestWithdrawalUseCase,
            wallet_repository_interface_1.IWalletRepository,
            bcb_service_1.BcbService,
            crypto_fee_service_1.CryptoFeeService,
            withdraw_service_1.WithdrawService,
        ],
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map