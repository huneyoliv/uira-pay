import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 100.00, description: 'Order amount' })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiProperty({ example: 'BRL', description: 'Fiat currency (informational only, backend uses tenant currency)', required: false })
    @IsOptional()
    @IsString()
    currency?: string;
}

