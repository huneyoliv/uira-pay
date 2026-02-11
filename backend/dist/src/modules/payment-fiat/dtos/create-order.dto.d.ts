export declare enum FiatCurrency {
    BRL = "BRL",
    EUR = "EUR"
}
export declare class CreateOrderDto {
    amount: number;
    currency: FiatCurrency;
}
