import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
    @ApiProperty({ example: 0.1, description: 'Amount to withdraw' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0.000001)
    amount: number;

    @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', description: 'Wallet address' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ example: 'ERC20', description: 'Network' })
    @IsNotEmpty()
    @IsString()
    network: string;


}
