import { Injectable, Logger } from '@nestjs/common';
import { EfiGatewayProvider } from '../../payment-fiat/providers/efi-gateway.provider';

@Injectable()
export class ReplenishLiquidityUseCase {
    private readonly logger = new Logger(ReplenishLiquidityUseCase.name);

    constructor(private readonly efiGatewayProvider: EfiGatewayProvider) { }

    async execute(pixCode: string, description?: string): Promise<any> {
        this.logger.log(`Replenishing liquidity via Pix Code. Description: ${description || 'N/A'}`);

        // In a real scenario, we might want to record this operation in a ledger or audit log.
        // For now, we just execute the payment.

        const result = await this.efiGatewayProvider.payPixCode(pixCode);

        this.logger.log('Liquidity replenishment payment executed successfully.');
        return result;
    }
}
