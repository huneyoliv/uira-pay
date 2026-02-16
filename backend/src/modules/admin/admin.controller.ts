import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TenantStatus } from '@prisma/client';
// TODO: Add Admin Guard later
// import { AdminGuard } from '../../guards/admin.guard'; 

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('approvals')
    async getPendingApprovals() {
        return this.adminService.getPendingTenants();
    }

    @Patch('approvals/:id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: TenantStatus,
    ) {
        return this.adminService.updateTenantStatus(id, status);
    }

    @Get('stats')
    async getStats() {
        return this.adminService.getDashboardStats();
    }
}
