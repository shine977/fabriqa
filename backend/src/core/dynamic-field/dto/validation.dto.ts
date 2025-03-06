import { IsEnum, IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationRuleType } from '../interfaces/field-validation.interface';

export class BaseValidationDto {
  @IsEnum(ValidationRuleType)
  type: ValidationRuleType;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RegexValidationDto extends BaseValidationDto {
  type: ValidationRuleType.REGEX;

  @IsString()
  pattern: string;
}

export class RangeValidationDto extends BaseValidationDto {
  type: ValidationRuleType.RANGE;

  @IsNumber()
  @IsOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  max?: number;
}

export class LengthValidationDto extends BaseValidationDto {
  type: ValidationRuleType.LENGTH;

  @IsNumber()
  @IsOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  max?: number;
}

export class EnumValidationDto extends BaseValidationDto {
  type: ValidationRuleType.ENUM;

  @IsArray()
  values: any[];
}

export class CustomValidationDto extends BaseValidationDto {
  type: ValidationRuleType.CUSTOM;

  @IsString()
  function: string;
}

// Discriminated union type for validation
export type ValidationDtoType =
  | RegexValidationDto
  | RangeValidationDto
  | LengthValidationDto
  | EnumValidationDto
  | CustomValidationDto;

// Concrete class for validation
export class ValidationDto {
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
