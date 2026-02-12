import { EfiGatewayProvider } from '../../payment-fiat/providers/efi-gateway.provider';
export declare class ReplenishLiquidityUseCase {
    private readonly efiGatewayProvider;
    private readonly logger;
    constructor(efiGatewayProvider: EfiGatewayProvider);
    execute(pixCode: string, description?: string): Promise<any>;
}
