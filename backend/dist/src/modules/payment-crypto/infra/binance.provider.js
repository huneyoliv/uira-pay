"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const decimal_js_1 = __importDefault(require("decimal.js"));
const ccxt = __importStar(require("ccxt"));
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
let BinanceProvider = class BinanceProvider {
    configService;
    exchange;
    isConfigured;
    apiKey;
    secretKey;
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('BINANCE_API_KEY') || '';
        this.secretKey = this.configService.get('BINANCE_SECRET_KEY') || '';
        this.isConfigured = !!(this.apiKey && this.secretKey && this.apiKey !== 'sua-api-key' && this.secretKey !== 'sua-secret-key');
        const isTestnet = this.configService.get('BINANCE_TESTNET') === 'true';
        this.baseUrl = isTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
        if (this.isConfigured) {
            this.exchange = new ccxt.binance({
                apiKey: this.apiKey,
                secret: this.secretKey,
                enableRateLimit: true,
                timeout: 30000,
                options: {
                    defaultType: 'spot',
                },
            });
            if (isTestnet) {
                this.exchange.setSandboxMode(true);
                console.log('BinanceProvider: Running in TESTNET mode.');
            }
        }
        else {
            console.warn('BinanceProvider: API keys are missing or placeholders. Binance integration will be disabled.');
        }
    }
    async getSpotPrice(pair) {
        if (!this.isConfigured) {
            throw new Error('Binance not configured');
        }
        try {
            const ticker = await this.exchange.fetchTicker(pair);
            if (!ticker || !ticker.last) {
                throw new Error('Price not found');
            }
            return new decimal_js_1.default(ticker.last);
        }
        catch (error) {
            console.error(`Error fetching spot price for ${pair}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch spot price');
        }
    }
    async getBalance() {
        if (!this.isConfigured)
            return new decimal_js_1.default(0);
        try {
            const balance = await this.exchange.fetchBalance();
            const usdt = balance['USDT'];
            return new decimal_js_1.default(usdt ? usdt.free : 0);
        }
        catch (error) {
            console.error('Error fetching balance:', error);
            return new decimal_js_1.default(0);
        }
    }
    async getAccountBalance(asset) {
        if (!this.isConfigured)
            return 0;
        try {
            const balance = await this.exchange.fetchBalance();
            const assetBalance = balance[asset];
            return assetBalance ? assetBalance.free : 0;
        }
        catch (error) {
            console.error(`Error fetching balance for ${asset}:`, error);
            throw new common_1.InternalServerErrorException(`Failed to fetch balance for ${asset}`);
        }
    }
    async createMarketBuyOrder(pair, quoteAmount) {
        if (!this.isConfigured) {
            throw new Error('Binance not configured');
        }
        try {
            console.log(`Creating Market Buy Order: ${pair}, Quote Amount (BRL): ${quoteAmount}`);
            const params = {
                quoteOrderQty: quoteAmount,
            };
            const order = await this.exchange.createOrder(pair, 'market', 'buy', undefined, undefined, params);
            return order;
        }
        catch (error) {
            console.error(`Error creating market buy order for ${pair}:`, error);
            throw new common_1.InternalServerErrorException(`Failed to create market buy order: ${error.message}`);
        }
    }
    async withdraw(address, amount, network, transactionId, coin = 'USDT') {
        if (network !== 'BINANCE_INTERNAL') {
            this.validateAddress(address, network);
        }
        const binanceNetwork = this.mapNetwork(network);
        try {
            if (!this.isConfigured) {
                throw new Error('Binance not configured');
            }
            console.log(`Withdrawing ${amount.toString()} ${coin} to ${address} on ${binanceNetwork} (TxId: ${transactionId})`);
            return await this.withdrawSigned(coin, address, amount.toNumber(), binanceNetwork, transactionId);
        }
        catch (error) {
            console.error('Binance withdrawal error:', error);
            const errorMessage = error.response?.data?.msg || error.message || 'Unknown Error';
            if (errorMessage.includes('judge withdraw check fail')) {
                throw new common_1.BadRequestException(`Binance Security Block: ${errorMessage}`);
            }
            if (errorMessage.includes('Insufficient funds')) {
                throw new common_1.BadRequestException(`Binance Error: Insufficient funds (System Wallet). Details: ${errorMessage}`);
            }
            if (errorMessage.includes('Invalid address') || errorMessage.includes('illegal')) {
                throw new common_1.BadRequestException(`Binance Error: Invalid address or email. Details: ${errorMessage}`);
            }
            throw new common_1.BadRequestException(`Binance Error: ${errorMessage}`);
        }
    }
    async withdrawSigned(coin, address, amount, network, withdrawOrderId) {
        const endpoint = '/sapi/v1/capital/withdraw/apply';
        const timestamp = Date.now();
        const params = {
            coin: coin,
            address: address,
            amount: amount.toString(),
            timestamp: timestamp.toString(),
            withdrawOrderId: withdrawOrderId,
            recvWindow: '5000'
        };
        if (network) {
            params.network = network;
        }
        const queryParams = new URLSearchParams(params);
        params.signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(queryParams.toString())
            .digest('hex');
        queryParams.append('signature', params.signature);
        const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
        try {
            const response = await axios_1.default.post(url, null, {
                headers: {
                    'X-MBX-APIKEY': this.apiKey,
                },
            });
            return response.data.id;
        }
        catch (error) {
            console.error('Binance Signed Request Failed:', error.response?.data || error.message);
            throw error;
        }
    }
    mapNetwork(network) {
        switch (network) {
            case 'POLYGON': return 'MATIC';
            case 'TRON': return 'TRX';
            case 'BINANCE_INTERNAL': return '';
            default: return network;
        }
    }
    validateAddress(address, network) {
        if (network === 'POLYGON') {
            if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
                throw new common_1.BadRequestException('Invalid Polygon address');
            }
        }
        else if (network === 'TRON') {
            if (!/^T[a-zA-Z0-9]{33}$/.test(address)) {
                throw new common_1.BadRequestException('Invalid Tron address');
            }
        }
    }
    async getWithdrawalFees() {
        if (!this.isConfigured)
            return {};
        try {
            const currencies = await this.exchange.fetchCurrencies();
            return currencies;
        }
        catch (error) {
            console.error(error);
            return {};
        }
    }
    async getWithdrawalStatus(withdrawalId, coin = 'USDT') {
        if (!this.isConfigured)
            return { status: 'UNKNOWN' };
        try {
            const withdrawals = await this.exchange.fetchWithdrawals(coin, undefined, 50);
            const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
            if (!withdrawal) {
                return { status: 'PENDING' };
            }
            if (withdrawal.status === 'ok') {
                return { status: 'COMPLETED', txHash: withdrawal.txid };
            }
            else if (withdrawal.status === 'failed' || withdrawal.status === 'canceled') {
                return { status: 'FAILED' };
            }
            return { status: 'PENDING' };
        }
        catch (error) {
            return { status: 'UNKNOWN' };
        }
    }
    async getMultiBalance() {
        if (!this.isConfigured)
            return { USDT: 0, USDC: 0, BRL: 0 };
        try {
            const balance = await this.exchange.fetchBalance();
            return {
                USDT: balance['USDT']?.free || 0,
                USDC: balance['USDC']?.free || 0,
                BRL: balance['BRL']?.free || 0,
            };
        }
        catch (error) {
            console.error('Error fetching multi-balance:', error);
            return { USDT: 0, USDC: 0, BRL: 0 };
        }
    }
    async rebalance(from, to, amount) {
        if (!this.isConfigured)
            throw new Error('Binance not configured');
        if (from === to)
            return null;
        try {
            const pair = 'USDC/USDT';
            const side = from === 'USDT' ? 'buy' : 'sell';
            console.log(`Rebalancing: ${side} ${pair}, amount: ${amount} ${from}`);
            const params = side === 'buy'
                ? { quoteOrderQty: amount }
                : {};
            const baseAmount = side === 'sell' ? amount : undefined;
            const order = await this.exchange.createOrder(pair, 'market', side, baseAmount, undefined, params);
            console.log(`Rebalance complete: ${JSON.stringify({ filled: order.filled, cost: order.cost, status: order.status })}`);
            return order;
        }
        catch (error) {
            console.error(`Rebalance error (${from}→${to}):`, error.message);
            throw new common_1.InternalServerErrorException(`Failed to rebalance ${from}→${to}: ${error.message}`);
        }
    }
};
exports.BinanceProvider = BinanceProvider;
exports.BinanceProvider = BinanceProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BinanceProvider);
//# sourceMappingURL=binance.provider.js.map