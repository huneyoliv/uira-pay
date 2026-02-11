export declare enum Currency {
    USDT = "USDT",
    USDC = "USDC"
}
export declare class UpdateConfigDto {
    defaultCurrency?: Currency;
    docNumber?: string;
    language?: string;
    theme?: string;
    currentPassword?: string;
}
