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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../identity/auth/infra/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let UploadController = class UploadController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    uploadFile(file) {
        const buffer = (0, fs_1.readFileSync)(file.path);
        const jpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const pngMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
        const gifMagic = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
        const pdfMagic = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
        if (!jpegMagic && !pngMagic && !gifMagic && !pdfMagic) {
            (0, fs_1.unlinkSync)(file.path);
            throw new common_1.BadRequestException('Invalid file content. File does not match allowed formats.');
        }
        const domain = this.configService.get('DOMAIN') || 'localhost:8080';
        const baseUrl = domain.includes('localhost')
            ? `http://${domain}`
            : `https://api.${domain}`;
        return {
            url: `${baseUrl}/upload/${file.filename}`,
            filename: file.filename,
            signedUrl: this.generateSignedUrl(file.filename),
        };
    }
    serveFile(filename, token, expires, res) {
        const sanitized = (0, path_1.basename)(filename);
        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new common_1.BadRequestException('Invalid filename');
        }
        const filePath = (0, path_1.join)('./uploads', sanitized);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.BadRequestException('File not found');
        }
        const secret = this.configService.get('JWT_SECRET');
        if (!secret) {
            throw new common_1.UnauthorizedException('Server configuration error');
        }
        if (!token || !expires) {
            throw new common_1.UnauthorizedException('Missing access token');
        }
        const expiresNum = parseInt(expires, 10);
        if (isNaN(expiresNum) || Date.now() > expiresNum) {
            throw new common_1.UnauthorizedException('Access token expired');
        }
        const expectedToken = crypto
            .createHmac('sha256', secret)
            .update(`${sanitized}:${expires}`)
            .digest('hex');
        if (token !== expectedToken) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        const domain = this.configService.get('DOMAIN');
        const allowedOrigin = domain ? `https://${domain}` : '*';
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.sendFile(sanitized, { root: './uploads' });
    }
    getSignedUrl(filename) {
        const sanitized = (0, path_1.basename)(filename);
        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new common_1.BadRequestException('Invalid filename');
        }
        const filePath = (0, path_1.join)('./uploads', sanitized);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.BadRequestException('File not found');
        }
        const expires = Date.now() + 3600 * 1000;
        return {
            signedUrl: this.generateSignedUrl(sanitized),
            expiresAt: expires,
        };
    }
    generateSignedUrl(filename) {
        const secret = this.configService.get('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const domain = this.configService.get('DOMAIN') || 'localhost:8080';
        const expires = Date.now() + 3600 * 1000;
        const token = crypto
            .createHmac('sha256', secret)
            .update(`${filename}:${expires}`)
            .digest('hex');
        const baseUrl = domain.includes('localhost')
            ? `http://${domain}`
            : `https://api.${domain}`;
        return `${baseUrl}/upload/${filename}?token=${token}&expires=${expires}`;
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
                return cb(new common_1.BadRequestException('Only image and PDF files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Query)('expires')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "serveFile", null);
__decorate([
    (0, common_1.Get)('signed-url/:filename'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "getSignedUrl", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map