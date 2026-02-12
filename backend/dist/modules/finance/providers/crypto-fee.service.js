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
var CryptoFeeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoFeeService = void 0;
const common_1 = require("@nestjs/common");
const binance_provider_1 = require("../../payment-crypto/infra/binance.provider");
const decimal_js_1 = __importDefault(require("decimal.js"));
let CryptoFeeService = CryptoFeeService_1 = class CryptoFeeService {
    binanceProvider;
    logger = new common_1.Logger(CryptoFeeService_1.name);
    feesCache = {};
    lastFetchTime = 0;
    CACHE_TTL = 5 * 60 * 1000;
    FALLBACK_FEES = {
        'USDT': [
            { network: 'BSC', fee: 0.01, currency: 'USDT', displayName: 'BNB Smart Chain (BEP20)' },
            { network: 'MATIC', fee: 1.0, currency: 'USDT', displayName: 'Polygon (MATIC)' },
            { network: 'SOL', fee: 1.0, currency: 'USDT', displayName: 'Solana' },
        ],
        'USDC': [
            { network: 'BSC', fee: 0.01, currency: 'USDC', displayName: 'BNB Smart Chain (BEP20)' },
            { network: 'MATIC', fee: 1.0, currency: 'USDC', displayName: 'Polygon (MATIC)' },
            { network: 'SOL', fee: 1.0, currency: 'USDC', displayName: 'Solana' },
        ]
    };
    constructor(binanceProvider) {
        this.binanceProvider = binanceProvider;
    }
    async getAvailableNetworks(currency) {
        await this.refreshFeesIfNeeded();
        return this.feesCache[currency] || this.FALLBACK_FEES[currency] || [];
    }
    async getFee(currency, network) {
        const networks = await this.getAvailableNetworks(currency);
        const networkFee = networks.find(n => n.network === network);
        if (!networkFee) {
            const fallbackNetworks = this.FALLBACK_FEES[currency] || [];
            const fallbackFee = fallbackNetworks.find(n => n.network === network);
            if (fallbackFee)
                return fallbackFee.fee;
            throw new Error(`Network ${network} not supported for ${currency}`);
        }
        return networkFee.fee;
    }
    async withdraw(address, amount, network, transactionId, coin = 'USDT') {
        return this.binanceProvider.withdraw(address, new decimal_js_1.default(amount), network, transactionId, coin);
    }
    async refreshFeesIfNeeded() {
        const now = Date.now();
        if (now - this.lastFetchTime < this.CACHE_TTL && Object.keys(this.feesCache).length > 0) {
            return;
        }
        try {
            this.logger.log('Fetching dynamic withdrawal fees from Binance...');
            const currencies = await this.binanceProvider.getWithdrawalFees();
            if (!currencies || Object.keys(currencies).length === 0) {
                this.logger.warn('Received empty currencies from Binance, using fallback/cache.');
                return;
            }
            const newCache = {};
            if (currencies['USDT']) {
                newCache['USDT'] = this.mapBinanceNetworks(currencies['USDT'], 'USDT');
            }
            if (currencies['USDC']) {
                newCache['USDC'] = this.mapBinanceNetworks(currencies['USDC'], 'USDC');
            }
            this.feesCache = newCache;
            this.lastFetchTime = now;
            this.logger.log('Withdrawal fees updated successfully.');
        }
        catch (error) {
            this.logger.error('Failed to update withdrawal fees from Binance', error);
        }
    }
    mapBinanceNetworks(currencyInfo, currencyCode) {
        const networks = [];
        if (currencyInfo.networks) {
            for (const netKey in currencyInfo.networks) {
                const net = currencyInfo.networks[netKey];
                if (['BSC', 'MATIC', 'SOL'].includes(net.id)) {
                    networks.push({
                        network: net.id,
                        fee: net.fee,
                        currency: currencyCode,
                        displayName: this.getDisplayName(net.id)
                    });
                }
            }
        }
        return networks;
    }
    getDisplayName(networkCode) {
        switch (networkCode) {
            case 'BSC': return 'BNB Smart Chain (BEP20)';
            case 'MATIC': return 'Polygon (MATIC)';
            case 'SOL': return 'Solana';
            default: return networkCode;
        }
    }
};
exports.CryptoFeeService = CryptoFeeService;
exports.CryptoFeeService = CryptoFeeService = CryptoFeeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [binance_provider_1.BinanceProvider])
], CryptoFeeService);
//# sourceMappingURL=crypto-fee.service.js.map