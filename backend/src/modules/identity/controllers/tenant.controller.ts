import { Controller, Get, Patch, Body, ForbiddenException, BadRequestException, Param, UseGuards } from '@nestjs/common';
import { UpdateConfigDto } from '../dtos/update-config.dto';
import { IWalletRepository } from '../../finance/domain/wallet.repository.interface';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtAuthGuard } from '../auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/infra/decorators/current-user.decorator';

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
            dataToUpdate.preference_locked_until = new Date(new Date().setMonth(new Date().getMonth() + 6)); // Lock for 6 months
        }

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: dataToUpdate,
        });

        return { success: true };
    }
}
