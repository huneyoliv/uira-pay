import { PrismaService } from '../../../infra/database/prisma.service';
export declare class WalletController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSavedWallets(req: any): Promise<{
        id: string;
        address: string;
        created_at: Date;
        tenant_id: string;
        network: string;
        nickname: string | null;
    }[]>;
    deleteSavedWallet(req: any, id: string): Promise<{
        message: string;
    }>;
}
