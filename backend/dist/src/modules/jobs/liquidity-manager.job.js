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
var LiquidityManagerJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityManagerJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const auto_convert_balance_usecase_1 = require("../finance/application/auto-convert-balance.usecase");
const binance_provider_1 = require("../payment-crypto/infra/binance.provider");
const efi_gateway_provider_1 = require("../payment-fiat/providers/efi-gateway.provider");
let LiquidityManagerJob = LiquidityManagerJob_1 = class LiquidityManagerJob {
    autoConvertBalanceUseCase;
    binanceProvider;
    efiGatewayProvider;
    configService;
    logger = new common_1.Logger(LiquidityManagerJob_1.name);
    failureCount = 0;
    MAX_FAILURES = 3;
    MIN_RESERVE = 500;
    REBALANCE_THRESHOLD = 200;
    MAX_REPLENISH_AMOUNT = 10000;
    MIN_EFI_RESERVE = 100;
    REPLENISH_COOLDOWN_MS = 60 * 60 * 1000;
    lastReplenishTime = 0;
    constructor(autoConvertBalanceUseCase, binanceProvider, efiGatewayProvider, configService) {
        this.autoConvertBalanceUseCase = autoConvertBalanceUseCase;
        this.binanceProvider = binanceProvider;
        this.efiGatewayProvider = efiGatewayProvider;
        this.configService = configService;
    }
    async handleCron() {
        if (this.failureCount >= this.MAX_FAILURES) {
            this.logger.error(`Liquidity Manager Job paused due to too many failures (${this.failureCount}). Check logs/Binance API.`);
            return;
        }
        this.logger.debug('Running Liquidity Manager Job...');
        try {
            await this.autoConvertBalanceUseCase.execute();
            await this.checkAndRebalance();
            await this.checkAndReplenish();
            this.failureCount = 0;
        }
        catch (error) {
            this.failureCount++;
            this.logger.error(`Liquidity Manager Job failed. Attempt ${this.failureCount}/${this.MAX_FAILURES}`, error);
        }
    }
    async checkAndRebalance() {
        try {
            const balances = await this.binanceProvider.getMultiBalance();
            const usdtLow = balances.USDT < this.MIN_RESERVE;
            const usdcLow = balances.USDC < this.MIN_RESERVE;
            if (usdtLow && !usdcLow && balances.USDC > this.MIN_RESERVE + this.REBALANCE_THRESHOLD) {
                const amountToMove = Math.min(this.MIN_RESERVE - balances.USDT, balances.USDC - this.MIN_RESERVE);
                if (amountToMove > 10) {
                    this.logger.warn(`Auto-rebalancing: ${amountToMove} USDC → USDT`);
                    await this.binanceProvider.rebalance('USDC', 'USDT', amountToMove);
                    this.logger.log('Rebalance USDC→USDT complete.');
                }
            }
            else if (usdcLow && !usdtLow && balances.USDT > this.MIN_RESERVE + this.REBALANCE_THRESHOLD) {
                const amountToMove = Math.min(this.MIN_RESERVE - balances.USDC, balances.USDT - this.MIN_RESERVE);
                if (amountToMove > 10) {
                    this.logger.warn(`Auto-rebalancing: ${amountToMove} USDT → USDC`);
                    await this.binanceProvider.rebalance('USDT', 'USDC', amountToMove);
                    this.logger.log('Rebalance USDT→USDC complete.');
                }
            }
        }
        catch (error) {
            this.logger.error('Rebalance check failed (non-critical)', error);
        }
    }
    async checkAndReplenish() {
        try {
            const now = Date.now();
            if (now - this.lastReplenishTime < this.REPLENISH_COOLDOWN_MS) {
                return;
            }
            const balances = await this.binanceProvider.getMultiBalance();
            const totalStables = balances.USDT + balances.USDC;
            if (totalStables >= this.MIN_RESERVE) {
                return;
            }
            const binancePayMerchantId = this.configService.get('BINANCE_PAY_MERCHANT_ID');
            if (binancePayMerchantId) {
                this.logger.warn('Binance Pay Merchant configured but integration not yet implemented.');
            }
            this.logger.error(`🚨 CRITICAL: Both stablecoins critically low! ` +
                `USDT: ${balances.USDT}, USDC: ${balances.USDC}, BRL on Binance: ${balances.BRL}. ` +
                `Manual BRL deposit to Binance required!`);
            try {
                const efiResponse = await this.efiGatewayProvider.getAccountBalance();
                const efiBrl = parseFloat(efiResponse?.saldo || '0');
                this.logger.warn(`Efí BRL balance available: R$ ${efiBrl.toFixed(2)}`);
            }
            catch {
            }
            this.lastReplenishTime = now;
        }
        catch (error) {
            this.logger.error('Replenish check failed (non-critical)', error);
        }
    }
};
exports.LiquidityManagerJob = LiquidityManagerJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiquidityManagerJob.prototype, "handleCron", null);
exports.LiquidityManagerJob = LiquidityManagerJob = LiquidityManagerJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auto_convert_balance_usecase_1.AutoConvertBalanceUseCase,
        binance_provider_1.BinanceProvider,
        efi_gateway_provider_1.EfiGatewayProvider,
        config_1.ConfigService])
], LiquidityManagerJob);
//# sourceMappingURL=liquidity-manager.job.js.map