import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/auth/infra/decorators/current-user.decorator';
import { TermsService } from './terms.service';

@Controller('tenant/terms')
@UseGuards(JwtAuthGuard)
export class TenantTermsController {

    constructor(private readonly termsService: TermsService) { }

    @Get('check')
    async checkNewTerms(@CurrentUser() user: any) {
        return this.termsService.checkNewTermsForUser(user.id);
    }

    @Get('current')
    async getCurrentTerms(@Query('type') type: string, @Query('lang') lang: string) {
        return this.termsService.getEffectiveDocument(type || 'terms', lang || 'pt');
    }

    @Post('accept')
    async acceptTerms(@CurrentUser() user: any) {
        return this.termsService.acceptTerms(user.id);
    }
}
