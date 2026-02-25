import {
    Controller, Get, Patch, Body, ForbiddenException, BadRequestException,
    UseGuards, UseInterceptors, UploadedFile, ParseFilePipeBuilder,
    HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateConfigDto } from '../dtos/update-config.dto';
import { CompanyProfileDto } from '../dtos/company-profile.dto';
import { IWalletRepository } from '../../finance/domain/wallet.repository.interface';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtAuthGuard } from '../auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/infra/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as path from 'path';
import { validateCompanyID } from '../validators';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class TenantController {
    constructor(
        private readonly walletRepository: IWalletRepository,
        private readonly prisma: PrismaService,
    ) { }

    @Get('balance')
    async getBalance(@CurrentUser() user: any) {
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

    @Patch('config')
    async updateConfig(@Body() body: UpdateConfigDto, @CurrentUser() user: any) {
        const tenantId = user.id;

        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new ForbiddenException('Tenant not found');
        }

        const currentTenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

        if (body.defaultCurrency && currentTenant?.preference_locked_until && currentTenant.preference_locked_until > new Date()) {
            throw new ForbiddenException(`Mudança bloqueada até ${currentTenant.preference_locked_until.toISOString()}`);
        }

        // SECURITY: Require password re-authentication for docNumber changes
        if (body.docNumber) {
            if (!body.currentPassword) {
                throw new BadRequestException('Current password is required to change document number');
            }
            const bcrypt = await import('bcrypt');
            const isPasswordValid = await bcrypt.compare(body.currentPassword, (currentTenant as any).password);
            if (!isPasswordValid) {
                throw new BadRequestException('Invalid password');
            }
        }

        const dataToUpdate: any = {
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

    @Patch('company-profile')
    async updateCompanyProfile(@Body() body: CompanyProfileDto, @CurrentUser() user: any) {
        const tenantId = user.id;

        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        // Only allow if doc_number is still PENDING (not yet filled)
        if (!tenant.doc_number.startsWith('PENDING-')) {
            throw new ForbiddenException('Company profile has already been completed');
        }

        // Validate docNumber using country-specific algorithm (double verification: front + back)
        const cleanDocNumber = body.docNumber.replace(/[^\d\w]/g, '');
        if (!validateCompanyID(cleanDocNumber, body.country)) {
            throw new BadRequestException(`Invalid document number for country ${body.country}`);
        }

        // Validate defaultCurrency
        if (!['USDT', 'USDC'].includes(body.defaultCurrency)) {
            throw new BadRequestException('Default currency must be USDT or USDC');
        }

        // Check uniqueness of doc_number
        const existingTenant = await this.prisma.tenant.findFirst({
            where: {
                doc_number: body.docNumber,
                id: { not: tenantId },
            } as any,
        });
        if (existingTenant) {
            throw new BadRequestException('Document number already in use by another account');
        }

        // Lock preference for 6 months
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
            } as any,
        });

        return { success: true };
    }

    @Patch('profile-photo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const fs = require('fs');
                const uploadPath = './uploads';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (_req, _file, cb) => {
                const uniqueName = crypto.randomBytes(16).toString('hex');
                const ext = path.extname(_file.originalname).toLowerCase();
                cb(null, `${uniqueName}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            // SECURITY: Validate MIME type (only png/jpg/jpeg)
            const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedMimes.includes(file.mimetype)) {
                return cb(new BadRequestException('Only PNG, JPG, and JPEG files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024, // 2MB max
        },
    }))
    async updateProfilePhoto(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const logger = new (require('@nestjs/common').Logger)('ProfilePhoto');

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            // Ensure uploads directory exists
            const fs = require('fs');
            if (!fs.existsSync('./uploads')) {
                fs.mkdirSync('./uploads', { recursive: true });
            }

            // SECURITY: Validate magic bytes to prevent MIME spoofing
            const buffer = fs.readFileSync(file.path);
            const jpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8;
            const pngMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

            if (!jpegMagic && !pngMagic) {
                fs.unlinkSync(file.path);
                throw new BadRequestException('Invalid file content. Only real PNG/JPEG images are accepted.');
            }

            // Delete previous profile photo if exists
            const currentTenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
            if (currentTenant && (currentTenant as any).profilePhotoUrl) {
                try {
                    const previousUrl: string = (currentTenant as any).profilePhotoUrl;
                    const previousFilename = previousUrl.split('/').pop();
                    if (previousFilename) {
                        const previousPath = path.join('./uploads', previousFilename);
                        if (fs.existsSync(previousPath)) {
                            fs.unlinkSync(previousPath);
                        }
                    }
                } catch (err) {
                    logger.warn(`Failed to delete previous profile photo: ${err.message}`);
                }
            }

            // Build URL using DOMAIN env var (consistent with other endpoints)
            const domain = process.env.DOMAIN;
            const baseUrl = domain
                ? `https://api.${domain}`
                : (process.env.API_URL || 'http://localhost:8080');
            const profilePhotoUrl = `${baseUrl}/upload/${file.filename}`;

            await this.prisma.tenant.update({
                where: { id: user.id },
                data: { profilePhotoUrl } as any,
            });

            return { profilePhotoUrl };
        } catch (err) {
            if (err instanceof BadRequestException) throw err;
            logger.error(`Profile photo upload failed for user ${user.id}: ${err.message}`, err.stack);
            throw new BadRequestException(`Upload failed: ${err.message}`);
        }
    }
}
