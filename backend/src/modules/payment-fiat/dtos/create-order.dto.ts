import { IsNotEmpty, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FiatCurrency {
    BRL = 'BRL',
    EUR = 'EUR',
}

export class CreateOrderDto {
    @ApiProperty({ example: 100.00, description: 'Order amount' })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiProperty({ enum: FiatCurrency, example: FiatCurrency.BRL, description: 'Fiat currency' })
    @IsNotEmpty()
    @IsEnum(FiatCurrency)
    currency: FiatCurrency;


}
