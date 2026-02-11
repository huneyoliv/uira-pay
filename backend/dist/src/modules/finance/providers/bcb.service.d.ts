export declare class BcbService {
    private readonly logger;
    private readonly API_URL;
    getExchangeRate(currency: string): Promise<number>;
}
