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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfiHmacGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let EfiHmacGuard = class EfiHmacGuard {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const nodeEnv = this.configService.get('NODE_ENV');
        const EFI_OFFICIAL_IP = '34.193.116.226';
        const isMtlsAuthorized = request.socket.authorized;
        if (isMtlsAuthorized) {
        }
        else {
            if (nodeEnv !== 'development') {
                const remoteIp = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
                const requestIps = Array.isArray(remoteIp) ? remoteIp : remoteIp.split(',').map(ip => ip.trim());
                if (!requestIps.includes(EFI_OFFICIAL_IP)) {
                    console.warn(`[Security Block] Access Denied for IP: ${remoteIp}. Expected Efí: ${EFI_OFFICIAL_IP}`);
                    throw new common_1.UnauthorizedException('Access Denied: Unauthorized IP.');
                }
            }
            const sharedSecret = this.configService.get('EFI_WEBHOOK_URL_SECRET');
            if (!sharedSecret) {
                console.error('[Configuration Error] EFI_WEBHOOK_URL_SECRET is missing. Cannot perform fallback validation.');
                throw new common_1.InternalServerErrorException('Security Configuration Error: Missing Webhook Fallback Secret.');
            }
            const hmacQuery = request.query.hmac;
            if (!hmacQuery || hmacQuery !== sharedSecret) {
                console.warn(`[Security Block] Invalid or Missing ?hmac= token. Received: ${hmacQuery}`);
                throw new common_1.UnauthorizedException('Access Denied: Invalid Authentication Token.');
            }
        }
        const signature = request.headers['x-ad-signature'] || request.headers['signature'];
        const timestamp = request.headers['x-request-timestamp'] || request.headers['request-timestamp'];
        const nonce = request.headers['x-nonce'] || request.headers['nonce'];
        const payload = request.rawBody;
        if (nodeEnv === 'development' && !signature) {
            console.warn('Webhook received without signature in DEV mode - Bypassing for testing.');
            return true;
        }
        if (!payload) {
            throw new common_1.InternalServerErrorException('Raw body not available. Check main.ts configuration.');
        }
        if (!signature) {
            throw new common_1.UnauthorizedException('Missing Webhook Signature.');
        }
        if (timestamp) {
            const requestTime = parseInt(timestamp, 10);
            const now = Date.now();
            const tolerance = 5 * 60 * 1000;
            if (isNaN(requestTime) || Math.abs(now - requestTime) > tolerance) {
                throw new common_1.BadRequestException('Request timestamp expired or invalid.');
            }
        }
        const secret = this.configService.get('EFI_WEBHOOK_SECRET');
        if (!secret) {
            console.error('EFI_WEBHOOK_SECRET is not defined');
            throw new common_1.InternalServerErrorException('Webhook secret not configured.');
        }
        const dataToSign = timestamp ? `${timestamp}${nonce || ''}${payload.toString()}` : payload.toString();
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex');
        const sigStr = (Array.isArray(signature) ? signature[0] : signature);
        const signatureBuffer = Buffer.from(sigStr);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            console.warn(`[Security Alert] Invalid Webhook Signature from IP: ${request.ip}`);
            throw new common_1.UnauthorizedException('Invalid Signature.');
        }
        return true;
    }
};
exports.EfiHmacGuard = EfiHmacGuard;
exports.EfiHmacGuard = EfiHmacGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EfiHmacGuard);
//# sourceMappingURL=efi-hmac.guard.js.map