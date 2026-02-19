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
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const update_config_dto_1 = require("../dtos/update-config.dto");
const company_profile_dto_1 = require("../dtos/company-profile.dto");
const wallet_repository_interface_1 = require("../../finance/domain/wallet.repository.interface");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const jwt_auth_guard_1 = require("../auth/infra/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/infra/decorators/current-user.decorator");
const multer_1 = require("multer");
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const validators_1 = require("../validators");
let TenantController = class TenantController {
    walletRepository;
    prisma;
    constructor(walletRepository, prisma) {
        this.walletRepository = walletRepository;
        this.prisma = prisma;
    }
    async getBalance(user) {
        const tenantId = user.id;
        const wallet = await this.walletRepository.findByTenantId(tenantId);
        if (!wallet) {
            return { balance: 0, currency: 'USDT' };
        }
        return {
            balance: wallet.balance,
            currency: wallet.currency,
        };
    }
    async updateConfig(body, user) {
        const tenantId = user.id;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const currentTenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (body.defaultCurrency && currentTenant?.preference_locked_until && currentTenant.preference_locked_until > new Date()) {
            throw new common_1.ForbiddenException(`Mudança bloqueada até ${currentTenant.preference_locked_until.toISOString()}`);
        }
        if (body.docNumber) {
            if (!body.currentPassword) {
                throw new common_1.BadRequestException('Current password is required to change document number');
            }
            const bcrypt = await import('bcrypt');
            const isPasswordValid = await bcrypt.compare(body.currentPassword, currentTenant.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
        }
        const dataToUpdate = {
            ...(body.docNumber ? { doc_number: body.docNumber } : {}),
            ...(body.language ? { language: body.language } : {}),
            ...(body.theme ? { theme: body.theme } : {}),
        };
        if (body.defaultCurrency) {
            dataToUpdate.default_currency = body.defaultCurrency;
            dataToUpdate.preference_locked_until = new Date(new Date().setMonth(new Date().getMonth() + 6));
        }
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: dataToUpdate,
        });
        return { success: true };
    }
    async updateCompanyProfile(body, user) {
        const tenantId = user.id;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant not found');
        }
        if (!tenant.doc_number.startsWith('PENDING-')) {
            throw new common_1.ForbiddenException('Company profile has already been completed');
        }
        const cleanDocNumber = body.docNumber.replace(/[^\d\w]/g, '');
        if (!(0, validators_1.validateCompanyID)(cleanDocNumber, body.country)) {
            throw new common_1.BadRequestException(`Invalid document number for country ${body.country}`);
        }
        if (!['USDT', 'USDC'].includes(body.defaultCurrency)) {
            throw new common_1.BadRequestException('Default currency must be USDT or USDC');
        }
        const existingTenant = await this.prisma.tenant.findFirst({
            where: {
                doc_number: body.docNumber,
                id: { not: tenantId },
            },
        });
        if (existingTenant) {
            throw new common_1.BadRequestException('Document number already in use by another account');
        }
        const lockUntil = new Date();
        lockUntil.setMonth(lockUntil.getMonth() + 6);
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: body.name,
                doc_number: body.docNumber,
                documentUrl: body.documentUrl,
                country: body.country,
                fiatCurrency: body.fiatCurrency,
                default_currency: body.defaultCurrency,
                preference_locked_until: lockUntil,
            },
        });
        return { success: true };
    }
    async updateProfilePhoto(user, file) {
        const logger = new (require('@nestjs/common').Logger)('ProfilePhoto');
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const fs = require('fs');
            if (!fs.existsSync('./uploads')) {
                fs.mkdirSync('./uploads', { recursive: true });
            }
            const buffer = fs.readFileSync(file.path);
            const jpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8;
            const pngMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
            if (!jpegMagic && !pngMagic) {
                fs.unlinkSync(file.path);
                throw new common_1.BadRequestException('Invalid file content. Only real PNG/JPEG images are accepted.');
            }
            const currentTenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
            if (currentTenant && currentTenant.profilePhotoUrl) {
                try {
                    const previousUrl = currentTenant.profilePhotoUrl;
                    const previousFilename = previousUrl.split('/').pop();
                    if (previousFilename) {
                        const previousPath = path.join('./uploads', previousFilename);
                        if (fs.existsSync(previousPath)) {
                            fs.unlinkSync(previousPath);
                        }
                    }
                }
                catch (err) {
                    logger.warn(`Failed to delete previous profile photo: ${err.message}`);
                }
            }
            const baseUrl = process.env.API_URL || 'https://api.swaptune.me';
            const profilePhotoUrl = `${baseUrl}/upload/${file.filename}`;
            await this.prisma.tenant.update({
                where: { id: user.id },
                data: { profilePhotoUrl },
            });
            return { profilePhotoUrl };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            logger.error(`Profile photo upload failed for user ${user.id}: ${err.message}`, err.stack);
            throw new common_1.BadRequestException(`Upload failed: ${err.message}`);
        }
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Patch)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_config_dto_1.UpdateConfigDto, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Patch)('company-profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_profile_dto_1.CompanyProfileDto, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateCompanyProfile", null);
__decorate([
    (0, common_1.Patch)('profile-photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (_req, _file, cb) => {
                const uniqueName = crypto.randomBytes(16).toString('hex');
                const ext = path.extname(_file.originalname).toLowerCase();
                cb(null, `${uniqueName}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedMimes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Only PNG, JPG, and JPEG files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateProfilePhoto", null);
exports.TenantController = TenantController = __decorate([
    (0, common_1.Controller)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wallet_repository_interface_1.IWalletRepository,
        prisma_service_1.PrismaService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map