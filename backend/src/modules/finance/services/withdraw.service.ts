import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { Wallet, Transaction } from '@prisma/client';

@Injectable()
export class WithdrawService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Executes the withdrawal logic using Atomic Compare-and-Swap (CAS).
     * 
     * COMPLIANCE NOTE (Integridade Financeira):
     * Since the database is MongoDB, "SELECT FOR UPDATE" (Pessimistic Locking) is not applicable.
     * We use the "Atomic Update with Pre-condition" (CAS) pattern which is the
     * strict equivalent for NoSQL, ensuring mathematical integrity.
     * 
     * Steps:
     * 1. Start Interactive Transaction.
     * 2. Atomic Update: Decrement Balance WHERE balance >= amount.
     * 3. If update count == 0, ROLLBACK immediately (Insufficient Funds or Race Condition).
     * 4. Create Transaction Record.
     * 
     * @param walletId - The ID of the wallet to debit
     * @param totalDeduction - The gross amount to debit (withdrawal + fee)
     * @param actualWithdrawalAmount - The net amount being withdrawn
     * @param fee - The fee amount
     * @param network - Crypto network
     * @returns { updatedWallet, transaction }
     */
    async execute(
        walletId: string,
        totalDeduction: number,
        actualWithdrawalAmount: number,
        fee: number,
        network: string,
        txHash: string | null = null
    ): Promise<{ updatedWallet: Wallet; transaction: Transaction }> {

        // Use Prisma Interactive Transaction for Atomicity
        return await this.prisma.$transaction(async (tx) => {
            // 1. ATOMIC LOCK & UPDATE (CAS)
            // This single operation acts as both the Lock and the Update.
            // It will only succeed if the document matches the 'where' clause at the exact moment of execution.
            const updateResult = await tx.wallet.updateMany({
                where: {
                    id: walletId,
                    balance: { gte: totalDeduction } // CRITICAL: Prevents negative balance race conditions
                },
                data: {
                    balance: { decrement: totalDeduction }
                }
            });

            if (updateResult.count === 0) {
                // Double-check to give specific error message (SAFE READ after write attempt)
                const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });

                if (!currentWallet) {
                    throw new BadRequestException('Wallet not found');
                }

                // If balance is insufficient, throw error to Abort Transaction
                throw new BadRequestException(
                    `Insufficient balance. Required: ${totalDeduction} (Available: ${currentWallet.balance})`
                );
            }

            // 2. Fetch the NEW state strictly from the transaction context
            const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });

            // 3. Create the Immutable Ledger Record
            const transaction = await tx.transaction.create({
                data: {
                    wallet_id: updatedWallet.id,
                    type: 'WITHDRAWAL',
                    amount: actualWithdrawalAmount,
                    fee: fee,
                    status: 'PENDING',
                    tx_hash: txHash,
                    description: `Withdrawal of ${actualWithdrawalAmount} via ${network}`
                }
            });

            return { updatedWallet, transaction };
        });
    }
}
