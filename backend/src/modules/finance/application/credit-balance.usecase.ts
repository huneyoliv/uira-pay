import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IWalletRepository } from '../domain/wallet.repository.interface';
import { Wallet } from '../domain/wallet.entity';

@Injectable()
export class CreditBalanceUseCase {
    constructor(private readonly walletRepository: IWalletRepository) { }

    async execute(tenantId: string, cryptoAmount: Decimal | number | string): Promise<Wallet> {
        let wallet = await this.walletRepository.findByTenantId(tenantId);

        if (!wallet) {
            // Create new wallet if it doesn't exist
            // Defaulting to USDT for now as per simple requirement, but ideally should come from tenant preference or input
            wallet = new Wallet(
                crypto.randomUUID(), // Assuming global crypto or uuid lib is available, or we let repo handle ID generation if DB generated. 
                // Ideally domain shouldn't generate ID if DB does, but for Entity purity we often do.
                // For this step I'll use a placeholder or assume UUID generation is handled or passed.
                // Let's use a simple random string for now or better, let's assume the repo handles creation if ID is null, 
                // but the Entity requires ID. I'll use a mock ID generator here for simplicity or import crypto.
                tenantId,
                'USDT',
                new Decimal(0),
                new Date(),
            );
            // Actually, to be strictly pure, we might need a factory or just generate UUID here.
            // Since I can't easily import uuid package without installing, I will rely on the repository to potentially handle or just use a simple random for now.
            // Wait, Node.js has crypto.randomUUID() in recent versions.
        }

        wallet.credit(cryptoAmount);

        if (await this.walletRepository.findByTenantId(tenantId)) {
            await this.walletRepository.save(wallet);
        } else {
            await this.walletRepository.create(wallet);
        }

        // Create Transaction Record
        // We use the cryptoAmount (Decimal) converted to number for now as per repo interface
        await this.walletRepository.addTransaction(
            wallet.id,
            Number(cryptoAmount),
            'DEPOSIT',
            'COMPLETED'
        );

        return wallet;
    }
}
