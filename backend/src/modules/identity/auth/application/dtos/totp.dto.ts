
import { IsNotEmpty, IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class Verify2FADto {
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class Validate2FADto {
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class Disable2FADto {
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class Reset2FADto {
    @IsNotEmpty()
    @IsString()
    backupCode: string;
}
