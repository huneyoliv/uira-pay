import { Injectable, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IWalletRepository } from '../domain/wallet.repository.interface';
import { Wallet } from '../domain/wallet.entity';

@Injectable()
export class DebitBalanceUseCase {
    constructor(private readonly walletRepository: IWalletRepository) { }

    async execute(tenantId: string, amount: Decimal | number | string): Promise<Wallet> {
        const wallet = await this.walletRepository.findByTenantId(tenantId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        try {
            wallet.debit(amount);
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }

        await this.walletRepository.save(wallet);

        return wallet;
    }
}
