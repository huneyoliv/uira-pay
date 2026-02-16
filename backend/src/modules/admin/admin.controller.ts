
import { Controller, Get, Patch, UseGuards, Query, Param, Body, Req, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../identity/auth/infra/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../identity/auth/infra/decorators/current-user.decorator';
import type { Request } from 'express';

function isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
}

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
        return this.adminService.getTenants(Number(page), Math.min(Number(limit), 100), search);
    }

    @Get('tenants/:id')
    async getTenantDetails(@Param('id') id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.getTenantDetail(id);
    }

    @Patch('tenants/:id/suspend')
    async suspendTenant(@Param('id') id: string, @CurrentUser() admin: any, @Req() req: Request) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.suspendTenant(id, true, admin.id, req.ip);
    }

    @Patch('tenants/:id/approve')
    async approveTenant(@Param('id') id: string, @CurrentUser() admin: any, @Req() req: Request) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.approveTenant(id, admin.id, req.ip);
    }

    @Patch('tenants/:id/reject')
    async rejectTenant(@Param('id') id: string, @CurrentUser() admin: any, @Req() req: Request) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.rejectTenant(id, admin.id, req.ip);
    }

    @Get('transactions')
    async getTransactions(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('type') type: string,
        @Query('status') status: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.adminService.getAllTransactions(Number(page), Math.min(Number(limit), 100), type, status, startDate, endDate);
    }

    @Get('withdrawals/pending')
    async getPendingWithdrawals() {
        return this.adminService.getPendingWithdrawals();
    }

    @Patch('withdrawals/:id/approve')
    async approveWithdrawal(@Param('id') id: string, @CurrentUser() admin: any, @Req() req: Request) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid withdrawal ID');
        return this.adminService.approveWithdrawal(id, admin.id, req.ip);
    }

    @Patch('withdrawals/:id/reject')
    async rejectWithdrawal(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser() admin: any,
        @Req() req: Request,
    ) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid withdrawal ID');
        return this.adminService.rejectWithdrawal(id, reason, admin.id, req.ip);
    }

    @Get('logs')
    async getSystemLogs(@Query('limit') limit: number = 50) {
        return this.adminService.getSystemLogs(Math.min(Number(limit), 200));
    }

    @Get('pending-approvals')
    async getPendingApprovals() {
        return this.adminService.getPendingApprovals();
    }

    @Patch('tenants/:id/block')
    async blockTenant(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser() admin: any,
        @Req() req: Request,
    ) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.blockTenant(id, reason, admin.id, req.ip);
    }

    @Patch('tenants/:id/unblock')
    async unblockTenant(
        @Param('id') id: string,
        @CurrentUser() admin: any,
        @Req() req: Request,
    ) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.unblockTenant(id, admin.id, req.ip);
    }

    @Patch('tenants/:id/request-documents')
    async requestDocuments(
        @Param('id') id: string,
        @Body('message') message: string,
        @CurrentUser() admin: any,
        @Req() req: Request,
    ) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid tenant ID');
        return this.adminService.requestDocuments(id, message, admin.id, req.ip);
    }
}
