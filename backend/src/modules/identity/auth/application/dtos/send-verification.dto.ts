import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email to verify' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'PT', required: false, description: 'Language for the verification email' })
    @IsOptional()
    @IsString()
    language?: string;
}
