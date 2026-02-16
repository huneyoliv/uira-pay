import {
    Controller, Get, Patch, Body, ForbiddenException, BadRequestException,
    UseGuards, UseInterceptors, UploadedFile, ParseFilePipeBuilder,
    HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateConfigDto } from '../dtos/update-config.dto';
import { IWalletRepository } from '../../finance/domain/wallet.repository.interface';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtAuthGuard } from '../auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/infra/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as path from 'path';

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

        if (body.defaultCurrency && currentTenant && currentTenant.preference_locked_until > new Date()) {
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

    @Patch('profile-photo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
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
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // SECURITY: Validate magic bytes to prevent MIME spoofing
        const buffer = require('fs').readFileSync(file.path);
        const jpegMagic = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const pngMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

        if (!jpegMagic && !pngMagic) {
            require('fs').unlinkSync(file.path);
            throw new BadRequestException('Invalid file content. Only real PNG/JPEG images are accepted.');
        }

        const baseUrl = process.env.API_URL || 'https://api.swaptune.me';
        const profilePhotoUrl = `${baseUrl}/upload/${file.filename}`;

        await this.prisma.tenant.update({
            where: { id: user.id },
            data: { profilePhotoUrl } as any,
        });

        return { profilePhotoUrl };
    }
}
