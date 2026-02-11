import { Module } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module';
import { TenantController } from './controllers/tenant.controller';
import { PrismaService } from '../../infra/database/prisma.service';

@Module({
    imports: [FinanceModule],
    controllers: [TenantController],
    providers: [PrismaService],
})
export class IdentityModule { }
