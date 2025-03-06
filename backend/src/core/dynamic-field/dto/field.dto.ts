import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, ValidationType } from '../types/field.types';

export class FieldValidationDto {
  @IsEnum(ValidationType)
  type: ValidationType;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  pattern?: string;

  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;

  @IsOptional()
  values?: any[];

  @IsOptional()
  function?: string;
}

export class CreateFieldDefinitionDto {
  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  order?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValidationDto)
  @IsOptional()
  validations?: FieldValidationDto[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateFieldDefinitionDto extends CreateFieldDefinitionDto {
  @IsString()
  @IsOptional()
  id?: string;
}
