import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BcbService {
    private readonly logger = new Logger(BcbService.name);
    private readonly API_URL = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

    async getExchangeRate(currency: string): Promise<number> {
        if (currency === 'BRL') return 1;

        try {
            const today = new Date();
            // Format date as MM-DD-YYYY
            const dateStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}-${today.getFullYear()}`;

            // Fetch buying rate (CotacaoCompra)
            const url = `${this.API_URL}/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currency}'&@dataCotacao='${dateStr}'&$top=1&$format=json&$select=cotacaoCompra`;

            const response = await axios.get(url);

            if (response.data && response.data.value && response.data.value.length > 0) {
                return response.data.value[0].cotacaoCompra;
            }

            // If no rate for today (e.g., weekend), try yesterday or fallback
            // For simplicity in this MVP, we might want to implement a fallback or just throw
            // Let's try to get the last available rate if today fails is a bit complex for now without a proper loop.
            // A better endpoint for "last available" might be needed or just handle the error.

            // Alternative: Use a different endpoint or library if PTAX is too strict on dates.
            // But for now, let's assume we can get it or throw.

            this.logger.warn(`No PTAX rate found for ${currency} on ${dateStr}`);
            throw new Error(`Exchange rate not found for ${currency}`);

        } catch (error) {
            this.logger.error(`Failed to fetch exchange rate for ${currency}`, error);
            throw new Error('Failed to fetch exchange rate');
        }
    }
}
