import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
    @ApiProperty({ example: 'My Company', description: 'Company name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: '12345678000195', description: 'Document number (CNPJ/CPF)' })
    @IsNotEmpty()
    @IsString()
    docNumber: string;

    @ApiProperty({ example: 'contact@mycompany.com', description: 'Company email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass@123', description: 'Password (min 6 chars)' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'https://example.com/doc.pdf', description: 'URL to the document' })
    @IsNotEmpty()
    @IsString()
    documentUrl: string;

    @ApiProperty({ example: 'BR', description: 'Country code used for validation' })
    @IsNotEmpty()
    @IsString()
    country: string;

    @ApiProperty({ example: 'BRL', description: 'Fiat currency' })
    @IsNotEmpty()
    @IsString()
    fiatCurrency: string;

    @ApiProperty({ description: 'Email verification token from /auth/verify-code' })
    @IsNotEmpty()
    @IsString()
    verificationToken: string;
}
