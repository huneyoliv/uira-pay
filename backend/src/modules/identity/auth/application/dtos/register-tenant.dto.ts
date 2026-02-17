import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
    @ApiProperty({ example: 'My Company', description: 'Company name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: '12345678000195', description: 'Document number (CNPJ/CPF)', required: false })
    @IsOptional()
    @IsString()
    docNumber?: string;

    @ApiProperty({ example: 'contact@mycompany.com', description: 'Company email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass@123', description: 'Password (min 6 chars)' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    @ApiProperty({ example: 'https://example.com/doc.pdf', description: 'URL to the document', required: false })
    @IsOptional()
    @IsString()
    documentUrl?: string;

    @ApiProperty({ example: 'BR', description: 'Country code used for validation', required: false })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({ example: 'BRL', description: 'Fiat currency', required: false })
    @IsOptional()
    @IsString()
    fiatCurrency?: string;

    @ApiProperty({ description: 'Email verification token from /auth/verify-code' })
    @IsNotEmpty()
    @IsString()
    verificationToken: string;
}
