
import { Controller, Get, Patch, UseGuards, Query, Param, Body, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../identity/auth/infra/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../identity/auth/infra/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    async getDashboardMetrics() {
        return this.adminService.getDashboardMetrics();
    }

    @Get('tenants')
    async getTenants(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        return this.adminService.getTenants(Number(page), Number(limit), search);
    }

    @Get('tenants/:id')
    async getTenantDetails(@Param('id') id: string) {
        return this.adminService.getTenantDetail(id);
    }

    @Patch('tenants/:id/suspend')
    async suspendTenant(@Param('id') id: string) {
        return this.adminService.suspendTenant(id, true);
    }

    @Patch('tenants/:id/approve')
    async approveTenant(@Param('id') id: string) {
        return this.adminService.approveTenant(id);
    }

    @Patch('tenants/:id/reject')
    async rejectTenant(@Param('id') id: string) {
        return this.adminService.rejectTenant(id);
    }

    @Get('transactions')
    async getTransactions(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('type') type: string,
        @Query('status') status: string,
    ) {
        return this.adminService.getAllTransactions(Number(page), Number(limit), type, status);
    }

    @Get('withdrawals/pending')
    async getPendingWithdrawals() {
        return this.adminService.getPendingWithdrawals();
    }

    @Patch('withdrawals/:id/approve')
    async approveWithdrawal(@Param('id') id: string, @CurrentUser() admin: any) {
        return this.adminService.approveWithdrawal(id);
    }

    @Patch('withdrawals/:id/reject')
    async rejectWithdrawal(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser() admin: any
    ) {
        return this.adminService.rejectWithdrawal(id, reason);
    }

    @Get('logs')
    async getSystemLogs() {
        return { logs: [] }; // Placeholder for now
    }
}
