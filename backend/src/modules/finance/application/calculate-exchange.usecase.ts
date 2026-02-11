import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

export interface ExchangeResult {
    netCryptoAmount: Decimal;
    totalFeeBrl: Decimal;
    exchangeRate: Decimal;
}

@Injectable()
export class CalculateExchangeUseCase {
    private readonly FEE_PERCENTAGE = new Decimal(0.035); // 3.5% (1.19% Efí + 2.31% Profit)
    private readonly SPREAD_PERCENTAGE = new Decimal(0.015); // 1.5% Spread

    execute(fiatAmount: Decimal | number | string, exchangeRate: number): ExchangeResult {
        const amount = new Decimal(fiatAmount);
        const rate = new Decimal(exchangeRate);

        if (amount.isNegative() || amount.isZero()) {
            throw new Error('Amount must be positive');
        }

        // 1. Deduct Fees (3.5%)
        const totalFeeBrl = amount.times(this.FEE_PERCENTAGE);
        const netFiatAmount = amount.minus(totalFeeBrl);

        // 2. Apply Spread to Exchange Rate (Rate * (1 + Spread))
        // We are buying Crypto, so the rate is higher.
        const rateWithSpread = rate.times(new Decimal(1).plus(this.SPREAD_PERCENTAGE));

        // 3. Calculate Crypto Amount
        const netCryptoAmount = netFiatAmount.dividedBy(rateWithSpread);

        return {
            netCryptoAmount,
            totalFeeBrl,
            exchangeRate: rate,
        };
    }
}
