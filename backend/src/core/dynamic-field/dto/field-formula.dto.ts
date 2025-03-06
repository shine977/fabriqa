// src/core/dynamic-field/dto/field-formula.dto.ts

import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFieldFormulaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  targetFieldId: string;

  @IsString()
  expression: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
