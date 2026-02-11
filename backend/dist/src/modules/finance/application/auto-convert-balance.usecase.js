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
var AutoConvertBalanceUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoConvertBalanceUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const binance_provider_1 = require("../../payment-crypto/infra/binance.provider");
const create_transaction_usecase_1 = require("./create-transaction.usecase");
const decimal_js_1 = __importDefault(require("decimal.js"));
let AutoConvertBalanceUseCase = AutoConvertBalanceUseCase_1 = class AutoConvertBalanceUseCase {
    prisma;
    binanceProvider;
    createTransactionUseCase;
    logger = new common_1.Logger(AutoConvertBalanceUseCase_1.name);
    constructor(prisma, binanceProvider, createTransactionUseCase) {
        this.prisma = prisma;
        this.binanceProvider = binanceProvider;
        this.createTransactionUseCase = createTransactionUseCase;
    }
    async execute() {
        this.logger.debug('Checking for BRL balance to auto-convert...');
        try {
            const brlBalance = await this.binanceProvider.getAccountBalance('BRL');
            if (brlBalance < 10) {
                this.logger.debug(`BRL Balance (${brlBalance}) is below minimum (10 BRL). Skipping conversion.`);
                return;
            }
            const pendingOrders = await this.prisma.order.findMany({
                where: {
                    status: 'PAID',
                    conversion_status: 'PENDING',
                },
                include: {
                    tenant: true,
                },
            });
            if (pendingOrders.length === 0) {
                this.logger.debug('No pending conversion orders found.');
                return;
            }
            const groups = {};
            for (const order of pendingOrders) {
                const targetCurrency = order.tenant?.default_currency || 'USDT';
                if (!groups[targetCurrency]) {
                    groups[targetCurrency] = { total: new decimal_js_1.default(0), orderIds: [] };
                }
                groups[targetCurrency].total = groups[targetCurrency].total.plus(order.fiat_amount);
                groups[targetCurrency].orderIds.push(order.id);
            }
            let remainingBrl = new decimal_js_1.default(brlBalance);
            for (const [currency, group] of Object.entries(groups)) {
                let amountToConvert = group.total;
                if (amountToConvert.gt(remainingBrl)) {
                    this.logger.warn(`${currency} group amount (${amountToConvert}) exceeds remaining BRL (${remainingBrl}). Capping.`);
                    amountToConvert = remainingBrl;
                }
                if (amountToConvert.lt(10)) {
                    this.logger.debug(`${currency} group amount (${amountToConvert}) below minimum. Skipping.`);
                    continue;
                }
                const pair = `${currency}/BRL`;
                this.logger.log(`Executing Market Buy: ${pair}, Amount: R$ ${amountToConvert}`);
                const orderResult = await this.binanceProvider.createMarketBuyOrder(pair, amountToConvert.toNumber());
                if (orderResult && orderResult.status === 'closed') {
                    const bought = orderResult.filled;
                    const spent = orderResult.cost;
                    const rate = orderResult.average || (spent / bought);
                    this.logger.log(`AUDIT: Convertido R$ ${spent} -> ${bought} ${currency} @ ${rate.toFixed(4)}`);
                    await this.prisma.order.updateMany({
                        where: { id: { in: group.orderIds } },
                        data: { conversion_status: 'COMPLETED' },
                    });
                    remainingBrl = remainingBrl.minus(spent);
                    this.logger.log(`Updated ${group.orderIds.length} orders to COMPLETED (${currency}).`);
                }
                else {
                    this.logger.error(`Market Order failed for ${pair}.`, orderResult);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to auto-convert balance', error);
        }
    }
};
exports.AutoConvertBalanceUseCase = AutoConvertBalanceUseCase;
exports.AutoConvertBalanceUseCase = AutoConvertBalanceUseCase = AutoConvertBalanceUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        binance_provider_1.BinanceProvider,
        create_transaction_usecase_1.CreateTransactionUseCase])
], AutoConvertBalanceUseCase);
//# sourceMappingURL=auto-convert-balance.usecase.js.map