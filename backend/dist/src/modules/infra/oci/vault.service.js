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
var VaultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const common_1 = require("@nestjs/common");
const common = __importStar(require("oci-common"));
const secrets = __importStar(require("oci-secrets"));
let VaultService = VaultService_1 = class VaultService {
    logger = new common_1.Logger(VaultService_1.name);
    secretsClient;
    constructor() { }
    async loadSecrets() {
        if (!this.secretsClient) {
            try {
                const provider = await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
                this.secretsClient = new secrets.SecretsClient({ authenticationDetailsProvider: provider });
            }
            catch (error) {
                this.logger.warn('Failed to initialize OCI Auth Provider. Vault integration disabled locally? ' + error.message);
                return;
            }
        }
        const secretVars = Object.keys(process.env).filter(key => key.startsWith('OCI_SECRET_'));
        if (secretVars.length === 0) {
            this.logger.log('No OCI_SECRET_* environment variables found. Skipping Vault fetch.');
            return;
        }
        this.logger.log(`Found ${secretVars.length} OCI secrets to fetch...`);
        for (const envVar of secretVars) {
            const secretOcid = process.env[envVar];
            const targetVar = envVar.replace('OCI_SECRET_', '');
            if (!secretOcid)
                continue;
            try {
                const req = {
                    secretId: secretOcid,
                    stage: secrets.requests.GetSecretBundleRequest.Stage.Current
                };
                const response = await this.secretsClient.getSecretBundle(req);
                const secretBundleContent = response.secretBundle.secretBundleContent;
                if (!secretBundleContent) {
                    this.logger.warn(`Secret ${envVar} has no content.`);
                    continue;
                }
                if (secretBundleContent.contentType === 'BASE64') {
                    const content = secretBundleContent.content;
                    if (content) {
                        const buff = Buffer.from(content, 'base64');
                        const secretValue = buff.toString('utf-8');
                        process.env[targetVar] = secretValue;
                        this.logger.log(`Secret loaded: ${targetVar} (from ${envVar})`);
                    }
                }
                else {
                    this.logger.warn(`Secret ${envVar} format not supported (contentType: ${secretBundleContent.contentType})`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to fetch secret ${envVar} (${secretOcid})`, error);
            }
        }
    }
};
exports.VaultService = VaultService;
exports.VaultService = VaultService = VaultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VaultService);
//# sourceMappingURL=vault.service.js.map