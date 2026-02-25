
import { IsNotEmpty, IsString, IsOptional, Length, IsBoolean, IsEmail, MinLength } from 'class-validator';

export class Verify2FADto {
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    emailCode?: string;
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

    @IsOptional()
    @IsString()
    @Length(6, 6)
    code?: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    emailCode?: string;
}

export class Reset2FADto {
    @IsNotEmpty()
    @IsString()
    backupCode: string;
}

export class Login2FADto {
    @IsNotEmpty()
    @IsString()
    tempToken: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class Login2FARecoveryDto {
    @IsNotEmpty()
    @IsString()
    tempToken: string;

    @IsNotEmpty()
    @IsString()
    backupCode: string;
}

export class SendSecurityCodeDto {
    @IsOptional()
    @IsString()
    purpose?: string;
}

export class VerifySecurityCodeDto {
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class RegenerateCodesDto {
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    totpCode?: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    emailCode?: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    newPassword: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    emailCode?: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    totpCode?: string;
}

export class ChangeEmailRequestDto {
    // No body needed — sends code to current email
}

export class ChangeEmailVerifyOldDto {
    @IsOptional()
    @IsString()
    @Length(6, 6)
    code?: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    totpCode?: string;
}

export class ChangeEmailSendNewCodeDto {
    @IsNotEmpty()
    @IsEmail()
    newEmail: string;

    @IsNotEmpty()
    @IsString()
    tempToken: string;
}

export class ChangeEmailConfirmDto {
    @IsNotEmpty()
    @IsEmail()
    newEmail: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    newEmailCode: string;

    @IsNotEmpty()
    @IsString()
    tempToken: string;
}
