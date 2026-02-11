import { UpdateConfigDto } from '../dtos/update-config.dto';
import { IWalletRepository } from '../../finance/domain/wallet.repository.interface';
import { PrismaService } from '../../../infra/database/prisma.service';
export declare class TenantController {
    private readonly walletRepository;
    private readonly prisma;
    constructor(walletRepository: IWalletRepository, prisma: PrismaService);
    getBalance(user: any): Promise<{
        balance: number;
        currency: string;
    } | {
        balance: import("decimal.js").Decimal;
        currency: string;
    }>;
    updateConfig(body: UpdateConfigDto, user: any): Promise<{
        success: boolean;
    }>;
}
