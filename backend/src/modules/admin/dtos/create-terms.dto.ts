import { IsNotEmpty, IsString, IsIn, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateTermsDto {
    @IsNotEmpty()
    @IsIn(['terms', 'privacy'])
    type: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500000)
    content_pt: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500000)
    content_en: string;

    @IsOptional()
    @IsString()
    @MaxLength(500000)
    content_es?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500000)
    content_fr?: string;

    @IsNotEmpty()
    @IsDateString()
    effectiveAt: string;

    @IsOptional()
    @IsBoolean()
    notifyUsers?: boolean;
}
