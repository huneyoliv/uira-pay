import { PrismaService } from '../../../infra/database/prisma.service';
export declare class TenantController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMetrics(req: any): Promise<{
        totalSales: number;
        balance: any;
        sales24h: number;
    }>;
    getRecentTransactions(req: any): Promise<{
        id: any;
        type: any;
        amount: any;
        status: any;
        currency: any;
        date: any;
    }[]>;
}
