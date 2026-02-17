import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyProfileDto {
    @ApiProperty({ example: 'My Company', description: 'Company name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: '12345678000195', description: 'Document number (CNPJ/EIN/SIRET etc.)' })
    @IsNotEmpty()
    @IsString()
    docNumber: string;

    @ApiProperty({ example: 'https://api.swaptune.me/uploads/doc.pdf', description: 'URL to the uploaded company document' })
    @IsNotEmpty()
    @IsString()
    documentUrl: string;

    @ApiProperty({ example: 'BR', description: 'Country code' })
    @IsNotEmpty()
    @IsString()
    country: string;

    @ApiProperty({ example: 'BRL', description: 'Fiat currency' })
    @IsNotEmpty()
    @IsString()
    fiatCurrency: string;

    @ApiProperty({ example: 'USDT', description: 'Default crypto currency (USDT or USDC)' })
    @IsNotEmpty()
    @IsString()
    defaultCurrency: string;
}

