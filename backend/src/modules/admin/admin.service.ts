import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getPendingTenants() {
        return this.prisma.tenant.findMany({
            where: {
                status: TenantStatus.PENDING,
            },
            select: {
                id: true,
                name: true,
                doc_number: true,
                email: true,
                documentUrl: true,
                created_at: true,
            },
        });
    }

    async updateTenantStatus(tenantId: string, status: TenantStatus) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status },
        });
    }

    async getDashboardStats() {
        const pendingCount = await this.prisma.tenant.count({
            where: { status: TenantStatus.PENDING },
        });

        const activeCount = await this.prisma.tenant.count({
            where: { status: TenantStatus.APPROVED },
        });

        return {
            pendingApprovals: pendingCount,
            activeTenants: activeCount,
        };
    }
}
