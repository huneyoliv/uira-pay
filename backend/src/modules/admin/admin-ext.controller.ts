import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../identity/auth/infra/decorators/current-user.decorator';
import { EfiService } from './services/efi.service';
import { BinanceService } from './services/binance.service';
import { TermsService } from './services/terms.service';
import { AdminEmailService } from './services/admin-email.service';
import { PrismaService } from '../../infra/database/prisma.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminExtController {

    constructor(
        private readonly efiService: EfiService,
        private readonly binanceService: BinanceService,
        private readonly termsService: TermsService,
        private readonly adminEmail: AdminEmailService,
        private readonly prisma: PrismaService,
    ) { }

    // ======== BALANCE ENDPOINTS ========

    @Get('balances')
    async getBalances() {
        const [efi, binanceBalances, binanceTotalUSDT] = await Promise.all([
            this.efiService.getBalance(),
            this.binanceService.getBalances(),
            this.binanceService.getTotalUSDT(),
        ]);

        return {
            efi,
            binance: {
                assets: binanceBalances,
                totalUSDT: binanceTotalUSDT,
            },
        };
    }

    // ======== TERMS ENDPOINTS ========

    @Get('terms')
    async getTerms(@Query('type') type?: string) {
        return this.termsService.getAll(type);
    }

    @Get('terms/latest/:type')
    async getLatestTerms(@Param('type') type: string) {
        return this.termsService.getLatest(type);
    }

    @Post('terms')
    async createTerms(@Body() body: any, @CurrentUser() admin: any) {
        const doc = await this.termsService.createOrUpdate({
            type: body.type,
            content_pt: body.content_pt,
            content_en: body.content_en,
            content_es: body.content_es || body.content_en,
            content_fr: body.content_fr || body.content_en,
            effectiveAt: body.effectiveAt,
            createdById: admin.id,
        });

        // Send bulk email notifications if requested
        if (body.notifyUsers) {
            const tenants = await this.prisma.tenant.findMany({
                where: { status: 'ACTIVE' } as any,
                select: { email: true, language: true } as any,
            });

            const effectiveDate = new Date(body.effectiveAt).toLocaleDateString('pt-BR');

            const recipients = (tenants as any[]).map((t) => ({
                email: t.email,
                language: this.normalizeLanguage(t.language),
            }));

            // Non-blocking bulk email
            this.adminEmail.sendBulkEmail(recipients, 'newTerms', { effectiveDate }).catch(() => { });
        }

        return doc;
    }

    private normalizeLanguage(lang: string | undefined): string {
        if (!lang) return 'PT';
        const map: Record<string, string> = {
            'pt-BR': 'PT', 'pt': 'PT',
            'en-US': 'EN', 'en': 'EN',
            'es-ES': 'ES', 'es': 'ES',
            'fr-FR': 'FR', 'fr': 'FR',
        };
        return map[lang] || lang.toUpperCase().split('-')[0] || 'PT';
    }
}
