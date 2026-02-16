
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminExtController } from './admin-ext.controller';
import { TenantTermsController } from './services/tenant-terms.controller';
import { AdminService } from './admin.service';
import { EfiService } from './services/efi.service';
import { BinanceService } from './services/binance.service';
import { TermsService } from './services/terms.service';
import { AdminEmailService } from './services/admin-email.service';

@Module({
    imports: [],
    controllers: [AdminController, AdminExtController, TenantTermsController],
    providers: [AdminService, EfiService, BinanceService, TermsService, AdminEmailService],
    exports: [TermsService],
})
export class AdminModule { }
