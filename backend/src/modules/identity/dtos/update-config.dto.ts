import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Currency {
    USDT = 'USDT',
    USDC = 'USDC',
}

export class UpdateConfigDto {
    @ApiProperty({ enum: Currency, required: false, description: 'Default currency' })
    @IsOptional()
    @IsEnum(Currency)
    defaultCurrency?: Currency;

    @ApiProperty({ example: '12345678000195', required: false, description: 'Document number' })
    @IsOptional()
    @IsString()
    docNumber?: string;

    @ApiProperty({ example: 'pt-BR', required: false, description: 'Language' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiProperty({ example: 'system', required: false, description: 'Theme preference (light, dark, system)' })
    @IsOptional()
    @IsString()
    theme?: string;

    @ApiProperty({ required: false, description: 'Current password (required when changing docNumber)' })
    @IsOptional()
    @IsString()
    currentPassword?: string;
}
