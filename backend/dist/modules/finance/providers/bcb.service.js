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
var BcbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcbService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let BcbService = BcbService_1 = class BcbService {
    logger = new common_1.Logger(BcbService_1.name);
    API_URL = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
    async getExchangeRate(currency) {
        if (currency === 'BRL')
            return 1;
        try {
            const today = new Date();
            const dateStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}-${today.getFullYear()}`;
            const url = `${this.API_URL}/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currency}'&@dataCotacao='${dateStr}'&$top=1&$format=json&$select=cotacaoCompra`;
            const response = await axios_1.default.get(url);
            if (response.data && response.data.value && response.data.value.length > 0) {
                return response.data.value[0].cotacaoCompra;
            }
            this.logger.warn(`No PTAX rate found for ${currency} on ${dateStr}`);
            throw new Error(`Exchange rate not found for ${currency}`);
        }
        catch (error) {
            this.logger.error(`Failed to fetch exchange rate for ${currency}`, error);
            throw new Error('Failed to fetch exchange rate');
        }
    }
};
exports.BcbService = BcbService;
exports.BcbService = BcbService = BcbService_1 = __decorate([
    (0, common_1.Injectable)()
], BcbService);
//# sourceMappingURL=bcb.service.js.map