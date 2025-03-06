// src/core/dynamic-field/dto/field-definition.dto.ts
import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FieldType, ValidationType } from '../types/field.types';

export class FieldValidationDto {
  @ApiProperty({ enum: ValidationType })
  @IsEnum(ValidationType)
  type: ValidationType;

  @ApiProperty({ required: false })
  @IsOptional()
  message?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  params?: Record<string, any>;
}

export class CreateFieldDefinitionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  defaultValue?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ type: [FieldValidationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValidationDto)
  validations?: FieldValidationDto[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateFieldDefinitionDto extends CreateFieldDefinitionDto {
  @ApiProperty()
  @IsString()
  id: string;
}
