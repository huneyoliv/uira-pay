import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getDashboardMetrics() {
        const totalTenants = await this.prisma.tenant.count();
        const activeTenants = await this.prisma.tenant.count({ where: { status: 'ACTIVE' } });
        const pendingTenants = await this.prisma.tenant.count({ where: { status: 'PENDING' } });
        const totalTransactions = await this.prisma.transaction.count();
        const pendingWithdrawals = await this.prisma.transaction.count({
            where: { type: 'WITHDRAWAL', status: 'PENDING' }
        });

        return {
            totalTenants,
            activeTenants,
            pendingTenants,
            totalTransactions,
            pendingWithdrawals,
        };
    }

    async getTenants(page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const [tenants, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    created_at: true,
                    isAdmin: true,
                }
            }),
            this.prisma.tenant.count({ where: where as any }),
        ]);

        return {
            data: tenants,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            }
        };
    }

    async getTenantDetail(id: string) {
        // Enriched detail view with wallets
        return this.prisma.tenant.findUnique({
            where: { id },
            include: {
                wallets: true,
            }
        });
    }

    async suspendTenant(id: string, suspend: boolean) {
        // TODO: Implement actual suspension logic (e.g., status = REJECTED or separate flag)
        // For now, let's assume REJECTED acts as suspended
        await this.prisma.tenant.update({
            where: { id },
            data: { status: suspend ? 'REJECTED' : 'ACTIVE' },
        });
        await this.logAction('SYSTEM', 'SUSPEND_TENANT', id, { suspended: suspend });
        return { success: true };
    }

    async approveTenant(tenantId: string, adminId: string = 'SYSTEM') {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'ACTIVE' },
        });

        await this.logAction(adminId, 'APPROVE_TENANT', tenantId, { email: tenant.email });
        this.logger.log(`Tenant ${tenantId} approved by ${adminId}`);
        return { success: true };
    }

    async rejectTenant(tenantId: string, adminId: string = 'SYSTEM') {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'REJECTED' },
        });

        await this.logAction(adminId, 'REJECT_TENANT', tenantId, { email: tenant.email });
        this.logger.log(`Tenant ${tenantId} rejected by ${adminId}`);
        return { success: true };
    }

    async getAllTransactions(
        page: number,
        limit: number,
        type?: string,
        status?: string,
        startDate?: string,
        endDate?: string
    ) {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type && type !== 'ALL') where.type = type;
        if (status && status !== 'ALL') where.status = status;

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at.gte = new Date(startDate);
            if (endDate) where.created_at.lte = new Date(endDate);
        }

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    wallet: {
                        include: {
                            tenant: {
                                select: { name: true, email: true }
                            }
                        }
                    }
                }
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return {
            data: transactions,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            }
        };
    }

    async getPendingWithdrawals() {
        return this.prisma.transaction.findMany({
            where: {
                type: 'WITHDRAWAL',
                status: 'PENDING',
            },
            include: {
                wallet: {
                    include: {
                        tenant: {
                            select: { name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });
    }

    async approveWithdrawal(id: string) {
        // Withdrawals are automatic now, but if we need manual override:
        await this.prisma.transaction.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        await this.logAction('SYSTEM', 'APPROVE_WITHDRAWAL', id, {});
        // In real system, trigger blockchain transfer here if not already done
        return { success: true };
    }

    async rejectWithdrawal(id: string, reason: string, adminId: string = 'SYSTEM') {
        const tx = await this.prisma.transaction.findUnique({
            where: { id },
            include: { wallet: true }
        });

        if (!tx) throw new Error('Transaction not found');

        // Refund balance
        await this.prisma.wallet.update({
            where: { id: tx.wallet_id },
            data: { balance: { increment: tx.amount + tx.fee } }
        });

        await this.prisma.transaction.update({
            where: { id },
            data: { status: 'FAILED', description: `Rejected by admin: ${reason}` }
        });

        await this.logAction(adminId, 'REJECT_WITHDRAWAL', id, { reason, amount: tx.amount });

        return { success: true };
    }

    async getSystemLogs(limit: number = 50) {
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                admin: {
                    select: { email: true }
                }
            }
        });
    }

    private async logAction(adminId: string, action: string, targetId?: string, details?: any) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    adminId, // Ensure this ID exists in Tenant table and is an admin
                    action,
                    targetId,
                    details: details || {},
                }
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log for ${action}`, error);
            // Don't block main flow if logging fails
        }
    }
}
