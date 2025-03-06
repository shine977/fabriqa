import { IsEnum, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ValidationRuleType } from '../interfaces/field-validation.interface';

export class NewValidationDto {
  @IsEnum(ValidationRuleType)
  type: ValidationRuleType;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  pattern?: string;

  @IsNumber()
  @IsOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  max?: number;

  @IsArray()
  @IsOptional()
  values?: any[];

  @IsString()
  @IsOptional()
  function?: string;
}
