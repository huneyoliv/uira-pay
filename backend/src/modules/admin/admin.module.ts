import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { InfraModule } from '../../infra/infra.module'; // Import InfraModule for PrismaService

@Module({
    imports: [InfraModule],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
