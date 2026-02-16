import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getDashboardMetrics() {
        const [
            totalTenants,
            totalTransactions,
            totalVolume,
            pendingWithdrawals,
            recentTenants,
        ] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.transaction.count(),
            this.prisma.transaction.aggregate({
                where: { status: 'COMPLETED', type: 'DEPOSIT' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.count({
                where: { status: 'PENDING', type: 'WITHDRAWAL' },
            }),
            this.prisma.tenant.findMany({
                orderBy: { created_at: 'desc' },
                take: 5,
                select: { id: true, name: true, email: true, created_at: true },
            }),
        ]);

        // Active tenants (had a transaction in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeTenants = await this.prisma.transaction.findMany({
            where: { created_at: { gte: thirtyDaysAgo } },
            select: { wallet: { select: { tenant_id: true } } },
            distinct: ['wallet_id'],
        });

        return {
            totalTenants,
            totalTransactions,
            totalVolume: totalVolume._sum.amount || 0,
            pendingWithdrawals,
            activeTenants: activeTenants.length,
            recentTenants,
        };
    }

    async getTenants(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where: any = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        } : {};

        const [tenants, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    doc_number: true,
                    default_currency: true,
                    country: true,
                    twoFactorEnabled: true,
                    isAdmin: true,
                    created_at: true,
                    status: true,
                    wallets: {
                        select: { balance: true, currency: true },
                    },
                },
            }),
            this.prisma.tenant.count({ where }),
        ]);

        return {
            tenants,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTenantDetail(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                wallets: true,
                orders: { orderBy: { created_at: 'desc' }, take: 10 },
            },
        });

        const recentTransactions = await this.prisma.transaction.findMany({
            where: { wallet: { tenant_id: tenantId } },
            orderBy: { created_at: 'desc' },
            take: 20,
        });

        return { tenant, recentTransactions };
    }

    async suspendTenant(tenantId: string, suspended: boolean) {
        // We use tokenVersion increment to invalidate all sessions when suspending
        if (suspended) {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { tokenVersion: { increment: 1 } },
            });
        }

        this.logger.log(`Tenant ${tenantId} ${suspended ? 'suspended' : 'activated'}`);
        return { success: true, suspended };
    }

    async approveTenant(tenantId: string) {
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'ACTIVE' },
        });
        this.logger.log(`Tenant ${tenantId} approved`);
        return { success: true };
    }

    async rejectTenant(tenantId: string) {
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'REJECTED' },
        });
        this.logger.log(`Tenant ${tenantId} rejected`);
        return { success: true };
    }

    async getAllTransactions(page: number = 1, limit: number = 20, type?: string, status?: string) {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    wallet: {
                        select: {
                            tenant_id: true,
                            tenant: { select: { name: true, email: true } },
                        },
                    },
                },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return {
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getPendingWithdrawals() {
        return this.prisma.transaction.findMany({
            where: { status: 'PENDING', type: 'WITHDRAWAL' },
            orderBy: { created_at: 'asc' },
            include: {
                wallet: {
                    select: {
                        tenant_id: true,
                        tenant: { select: { name: true, email: true } },
                    },
                },
            },
        });
    }

    async approveWithdrawal(transactionId: string) {
        await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'COMPLETED' },
        });
        this.logger.log(`Withdrawal ${transactionId} approved by admin`);
        return { success: true };
    }

    async rejectWithdrawal(transactionId: string, reason?: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { wallet: true },
        });

        if (transaction) {
            // Refund the amount back to the wallet
            await this.prisma.$transaction([
                this.prisma.wallet.update({
                    where: { id: transaction.wallet_id },
                    data: { balance: { increment: transaction.amount + (transaction as any).fee } },
                }),
                this.prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: 'FAILED',
                        description: reason || 'Rejected by admin',
                    },
                }),
            ]);
        }

        this.logger.log(`Withdrawal ${transactionId} rejected by admin. Reason: ${reason || 'N/A'}`);
        return { success: true };
    }
}
