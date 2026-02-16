import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawalDto {
    @ApiProperty({ example: 100, description: 'Amount to withdraw' })
    @IsNotEmpty()
    @IsNumber()
    @Min(10)
    amount: number;

    @ApiProperty({ example: 'TRC20', description: 'Blockchain network or BINANCE_INTERNAL' })
    @IsNotEmpty()
    @IsString()
    network: string;

    @ApiProperty({ example: 'TXyz123...', description: 'Destination wallet address or Binance email' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ example: true, required: false, description: 'Save wallet for future use' })
    @IsOptional()
    @IsBoolean()
    save_wallet?: boolean;

    @ApiProperty({ example: 'My Wallet', required: false, description: 'Nickname for saved wallet' })
    @IsOptional()
    @IsString()
    nickname?: string;

    @ApiProperty({ example: '123456', required: false, description: '2FA TOTP code (required if 2FA is enabled)' })
    @IsOptional()
    @IsString()
    totpCode?: string;
}
