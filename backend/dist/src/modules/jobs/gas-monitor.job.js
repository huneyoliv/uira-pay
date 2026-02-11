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
var GasMonitorJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasMonitorJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const binance_provider_1 = require("../payment-crypto/infra/binance.provider");
let GasMonitorJob = GasMonitorJob_1 = class GasMonitorJob {
    binanceProvider;
    logger = new common_1.Logger(GasMonitorJob_1.name);
    MIN_RESERVE = 500;
    constructor(binanceProvider) {
        this.binanceProvider = binanceProvider;
    }
    async handleCron() {
        this.logger.debug('Checking crypto balances...');
        try {
            const balances = await this.binanceProvider.getMultiBalance();
            this.logger.log(`Balances — USDT: ${balances.USDT} | USDC: ${balances.USDC} | BRL: ${balances.BRL}`);
            if (balances.USDT < this.MIN_RESERVE) {
                this.logger.warn(`⚠️ Low USDT Balance: ${balances.USDT} (min: ${this.MIN_RESERVE})`);
            }
            if (balances.USDC < this.MIN_RESERVE) {
                this.logger.warn(`⚠️ Low USDC Balance: ${balances.USDC} (min: ${this.MIN_RESERVE})`);
            }
        }
        catch (error) {
            this.logger.error('Failed to check balances', error);
        }
    }
};
exports.GasMonitorJob = GasMonitorJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GasMonitorJob.prototype, "handleCron", null);
exports.GasMonitorJob = GasMonitorJob = GasMonitorJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [binance_provider_1.BinanceProvider])
], GasMonitorJob);
//# sourceMappingURL=gas-monitor.job.js.map