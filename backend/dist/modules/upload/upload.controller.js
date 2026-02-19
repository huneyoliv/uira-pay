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
            url: `${baseUrl}/uploads/${file.filename}`
        };
    }
    serveFile(filename, res) {
        const sanitized = (0, path_1.basename)(filename);
        if (!sanitized || sanitized !== filename || sanitized.includes('\0')) {
            throw new common_1.BadRequestException('Invalid filename');
        }
        const filePath = (0, path_1.join)('./uploads', sanitized);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.BadRequestException('File not found');
        }
        const domain = this.configService.get('DOMAIN');
        const allowedOrigin = domain ? `https://${domain}` : '*';
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.sendFile(sanitized, { root: './uploads' });
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
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "serveFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map