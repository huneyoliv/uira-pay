import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { AdminEmailService } from './services/admin-email.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly adminEmail: AdminEmailService,
    ) { }

    async getDashboardMetrics() {
        const [totalTenants, activeTenants, pendingTenants, totalTransactions, pendingWithdrawals, volumeAgg, recentTenants] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.tenant.count({ where: { status: 'PENDING' } }),
            this.prisma.transaction.count(),
            this.prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
            this.prisma.transaction.aggregate({
                where: { type: 'DEPOSIT', status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.tenant.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                select: { id: true, name: true, email: true, created_at: true },
            }),
        ]);

        return {
            totalTenants,
            activeTenants,
            pendingTenants,
            totalTransactions,
            pendingWithdrawals,
            totalVolume: volumeAgg._sum.amount || 0,
            recentTenants,
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
                    doc_number: true,
                    default_currency: true,
                    country: true,
                    twoFactorEnabled: true,
                    isAdmin: true,
                    status: true,
                    created_at: true,
                    wallets: {
                        select: { balance: true, currency: true },
                    },
                }
            }),
            this.prisma.tenant.count({ where: where as any }),
        ]);

        return {
            tenants,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTenantDetail(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                doc_number: true,
                default_currency: true,
                country: true,
                twoFactorEnabled: true,
                isAdmin: true,
                status: true,
                created_at: true,
                profilePhotoUrl: true,
                wallets: {
                    select: { id: true, balance: true, currency: true },
                },
            },
        });

        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    async suspendTenant(id: string, suspend: boolean, adminId: string, ipAddress?: string) {
        await this.prisma.tenant.update({
            where: { id },
            data: { status: suspend ? 'REJECTED' : 'ACTIVE' },
        });
        await this.logAction(adminId, 'SUSPEND_TENANT', id, { suspended: suspend }, ipAddress);
        return { success: true };
    }

    async approveTenant(tenantId: string, adminId: string, ipAddress?: string) {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'ACTIVE' },
        });

        await this.logAction(adminId, 'APPROVE_TENANT', tenantId, { email: tenant.email }, ipAddress);
        this.logger.log(`Tenant ${tenantId} approved by ${adminId}`);
        return { success: true };
    }

    async rejectTenant(tenantId: string, adminId: string, ipAddress?: string) {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'REJECTED' },
        });

        await this.logAction(adminId, 'REJECT_TENANT', tenantId, { email: tenant.email }, ipAddress);
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

    async approveWithdrawal(id: string, adminId: string, ipAddress?: string) {
        await this.prisma.transaction.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        await this.logAction(adminId, 'APPROVE_WITHDRAWAL', id, {}, ipAddress);
        return { success: true };
    }

    async rejectWithdrawal(id: string, reason: string, adminId: string, ipAddress?: string) {
        const tx = await this.prisma.transaction.findUnique({
            where: { id },
            include: { wallet: true }
        });

        if (!tx) throw new NotFoundException('Transaction not found');

        // Refund balance
        await this.prisma.wallet.update({
            where: { id: tx.wallet_id },
            data: { balance: { increment: tx.amount + tx.fee } }
        });

        await this.prisma.transaction.update({
            where: { id },
            data: { status: 'FAILED', description: `Rejected by admin: ${reason}` }
        });

        await this.logAction(adminId, 'REJECT_WITHDRAWAL', id, { reason, amount: tx.amount }, ipAddress);

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

    async blockTenant(tenantId: string, reason: string, adminId: string, ipAddress?: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                status: 'BLOCKED',
                blockedAt: new Date(),
                blockedReason: reason,
            } as any,
        });

        await this.logAction(adminId, 'BLOCK_TENANT', tenantId, { reason }, ipAddress);
        this.logger.log(`Tenant ${tenantId} blocked by admin ${adminId}: ${reason}`);

        // Send email notification
        const lang = this.normalizeLanguage((tenant as any).language);
        this.adminEmail.sendAdminEmail((tenant as any).email, 'accountBlocked', lang, { reason }).catch(() => { });

        return { success: true, message: 'Tenant blocked successfully' };
    }

    async unblockTenant(tenantId: string, adminId: string, ipAddress?: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                status: 'ACTIVE',
                blockedAt: null,
                blockedReason: null,
            } as any,
        });

        await this.logAction(adminId, 'UNBLOCK_TENANT', tenantId, {}, ipAddress);
        this.logger.log(`Tenant ${tenantId} unblocked by admin ${adminId}`);

        // Send email notification
        const lang = this.normalizeLanguage((tenant as any).language);
        this.adminEmail.sendAdminEmail((tenant as any).email, 'accountUnblocked', lang).catch(() => { });

        return { success: true, message: 'Tenant unblocked successfully' };
    }

    async requestDocuments(tenantId: string, message: string, adminId: string, ipAddress?: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                documentRequested: true,
                documentRequestMsg: message,
            } as any,
        });

        await this.logAction(adminId, 'REQUEST_DOCUMENTS', tenantId, { message }, ipAddress);
        this.logger.log(`Documents requested for tenant ${tenantId} by admin ${adminId}`);

        // Send email notification
        const lang = this.normalizeLanguage((tenant as any).language);
        this.adminEmail.sendAdminEmail((tenant as any).email, 'documentRequest', lang, { message }).catch(() => { });

        return { success: true, message: 'Document request sent successfully' };
    }

    async getPendingApprovals() {
        return this.prisma.tenant.findMany({
            where: { status: 'PENDING' } as any,
            select: {
                id: true,
                name: true,
                email: true,
                doc_number: true,
                country: true,
                created_at: true,
            } as any,
            orderBy: { created_at: 'asc' },
        });
    }

    private async logAction(adminId: string, action: string, targetId?: string, details?: any, ipAddress?: string) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    adminId,
                    action,
                    targetId,
                    details: details || {},
                    ipAddress: ipAddress || null,
                }
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log for ${action}`, error);
        }
    }

    private normalizeLanguage(lang: string | undefined): string {
        if (!lang) return 'PT';
        const map: Record<string, string> = {
            'pt-BR': 'PT', 'pt': 'PT',
            'en-US': 'EN', 'en': 'EN',
            'es-ES': 'ES', 'es': 'ES',
            'fr-FR': 'FR', 'fr': 'FR',
        };
        return map[lang] || lang.toUpperCase().split('-')[0] || 'PT';
    }
}
