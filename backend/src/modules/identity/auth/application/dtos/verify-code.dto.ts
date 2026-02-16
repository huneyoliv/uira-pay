import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email associated with the verification code' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: '6-digit verification code' })
    @IsNotEmpty()
    @IsString()
    code: string;
}
