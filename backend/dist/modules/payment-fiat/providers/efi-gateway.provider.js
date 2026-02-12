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
exports.EfiGatewayProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const gn_api_sdk_typescript_1 = __importDefault(require("gn-api-sdk-typescript"));
let EfiGatewayProvider = class EfiGatewayProvider {
    configService;
    efi;
    constructor(configService) {
        this.configService = configService;
        const certificatePath = this.resolveCertificatePath();
        const efiSandbox = this.configService.get('EFI_SANDBOX');
        const isSandbox = efiSandbox !== undefined
            ? efiSandbox === 'true'
            : process.env.NODE_ENV !== 'production';
        const options = {
            sandbox: isSandbox,
            client_id: this.configService.get('EFI_CLIENT_ID') || '',
            client_secret: this.configService.get('EFI_CLIENT_SECRET') || '',
            certificate: certificatePath,
        };
        console.log(`Efí SDK initialized in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
        if (!options.certificate) {
            console.error('CRITICAL: Efí Certificate path could not be resolved.');
        }
        this.efi = new gn_api_sdk_typescript_1.default(options);
    }
    resolveCertificatePath() {
        const certBase64 = this.configService.get('EFI_CERTIFICATE_BASE64');
        if (certBase64) {
            const tempCertPath = path.join(os.tmpdir(), 'efi-cert.p12');
            const certBuffer = Buffer.from(certBase64, 'base64');
            fs.writeFileSync(tempCertPath, certBuffer);
            return tempCertPath;
        }
        const certPath = this.configService.get('EFI_CERTIFICATE_PATH');
        if (!certPath) {
            throw new Error('FATAL: Neither EFI_CERTIFICATE_BASE64 nor EFI_CERTIFICATE_PATH is configured.');
        }
        return path.isAbsolute(certPath)
            ? certPath
            : path.resolve(process.cwd(), certPath);
    }
    async createPixCharge(amount) {
        try {
            const body = {
                calendario: {
                    expiracao: 3600,
                },
                valor: {
                    original: amount.toFixed(2),
                },
                chave: 'CHAVE_PIX_AQUI',
                solicitacaoPagador: 'Cobrança UIRÁ Payments',
            };
            const pixKey = this.configService.get('EFI_PIX_KEY');
            if (!pixKey) {
                throw new common_1.InternalServerErrorException('EFI_PIX_KEY not configured');
            }
            body.chave = pixKey;
            const charge = await this.efi.pixCreateImmediateCharge({}, body);
            const txid = charge.txid;
            const qrCode = await this.efi.pixGenerateQRCode({ id: charge.loc.id });
            return {
                txid: txid,
                pixCode: qrCode.qrcode,
            };
        }
        catch (error) {
            console.error('Error creating Pix charge:', error);
            throw new common_1.InternalServerErrorException('Failed to create Pix charge');
        }
    }
    async getPixChargeStatus(txid) {
        try {
            const response = await this.efi.pixDetailCharge({ txid: txid });
            return response.status;
        }
        catch (error) {
            if (error?.nome === 'cobranca_nao_encontrada' || error?.message === 'cobranca_nao_encontrada') {
                return null;
            }
            console.error(`Error fetching Pix charge status for ${txid}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch Pix charge status');
        }
    }
    async payPixCode(pixCode, value) {
        try {
            const body = {
                pix: pixCode
            };
            const response = await this.efi.pixPagamento({}, body);
            return response;
        }
        catch (error) {
            console.error('Error paying Pix Code:', error);
            throw new common_1.InternalServerErrorException(`Failed to pay Pix Code: ${error.message}`);
        }
    }
    async updateConfig(config) {
        try {
            const response = await this.efi.updateAccountConfig({}, config);
            return response;
        }
        catch (error) {
            console.error('Error updating Efí config:', error);
            throw new common_1.InternalServerErrorException(`Failed to update Efí config: ${error.message}`);
        }
    }
    async registerWebhook(pixKey, webhookUrl) {
        try {
            const params = {
                chave: pixKey,
            };
            const body = {
                webhookUrl: webhookUrl,
            };
            const response = await this.efi.pixConfigWebhook(params, body);
            return response;
        }
        catch (error) {
            console.error('Error registering Efí webhook:', error);
            throw new common_1.InternalServerErrorException(`Failed to register Efí webhook: ${error.message}`);
        }
    }
    async getAccountBalance() {
        try {
            const response = await this.efi.getAccountBalance();
            return response;
        }
        catch (error) {
            console.error('Error fetching account balance:', error);
            throw error;
        }
    }
};
exports.EfiGatewayProvider = EfiGatewayProvider;
exports.EfiGatewayProvider = EfiGatewayProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EfiGatewayProvider);
//# sourceMappingURL=efi-gateway.provider.js.map