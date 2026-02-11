import Decimal from 'decimal.js';
export interface ExchangeResult {
    netCryptoAmount: Decimal;
    totalFeeBrl: Decimal;
    exchangeRate: Decimal;
}
export declare class CalculateExchangeUseCase {
    private readonly FEE_PERCENTAGE;
    private readonly SPREAD_PERCENTAGE;
    execute(fiatAmount: Decimal | number | string, exchangeRate: number): ExchangeResult;
}
