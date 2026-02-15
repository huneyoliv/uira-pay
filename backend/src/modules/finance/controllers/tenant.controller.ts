import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../../../infra/database/prisma.service';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('dashboard/metrics')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    async getMetrics(@Request() req: any) {
        const tenantId = req.user.id;
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [totalSales, wallets, sales24h] = await Promise.all([
            this.prisma.order.aggregate({
                where: {
                    tenant_id: tenantId,
                    status: { in: ['PAID', 'COMPLETED'] },
                },
                _sum: {
                    crypto_amount_est: true,
                },
            }),
            this.prisma.wallet.findMany({
                where: { tenant_id: tenantId },
            }),
            this.prisma.order.aggregate({
                where: {
                    tenant_id: tenantId,
                    status: { in: ['PAID', 'COMPLETED'] },
                    created_at: { gte: yesterday },
                },
                _sum: {
                    crypto_amount_est: true,
                },
            }),
        ]);

        // SAFEGUARD: Only sum balances of stablecoins (USDT/USDC) or match tenant preference.
        // For this refactor, we assume the dashboard shows TOTAL USDT Equivalent. 
        // If we have mixed currencies, simple addition is WRONG.
        // As a safe fix, we filter for USDT.
        const totalBalance = wallets
            .filter((w: any) => w.currency === 'USDT' || w.currency === 'USDC') // Assuming 1:1 for simplicity or just summing stables
            .reduce((acc: number, wallet: any) => acc + wallet.balance, 0);

        return {
            totalSales: totalSales._sum?.crypto_amount_est || 0,
            balance: totalBalance,
            sales24h: sales24h._sum?.crypto_amount_est || 0,
        };
    }

    @Get('dashboard/transactions')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    async getRecentTransactions(@Request() req: any) {
        const tenantId = req.user.id;

        const transactions = await this.prisma.transaction.findMany({
            where: {
                wallet: {
                    tenant_id: tenantId,
                },
            },
            orderBy: {
                created_at: 'desc',
            },
            take: 10,
            include: {
                wallet: true,
            },
        });

        return transactions.map((tx: any) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            currency: tx.wallet.currency,
            date: tx.created_at,
        }));
    }
}
