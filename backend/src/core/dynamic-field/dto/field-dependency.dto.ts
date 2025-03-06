// src/core/dynamic-field/dto/field-dependency.dto.ts

import { IsEnum, IsString, IsNumber, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  DependencyType,
  DependencyOperator,
  DependencyActionType,
  DependencyCondition,
  DependencyAction,
} from '../interfaces/field-dependency.interface';

export class DependencyConditionDto implements DependencyCondition {
  @IsEnum(DependencyOperator)
  operator: DependencyOperator;

  @IsOptional()
  value?: any;

  @IsOptional()
  values?: any[];
}

export class DependencyActionDto implements DependencyAction {
  @IsEnum(DependencyActionType)
  type: DependencyActionType;

  @IsOptional()
  value?: any;

  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateFieldDependencyDto {
  @IsString()
  sourceFieldId: string;

  @IsString()
  targetFieldId: string;

  @IsEnum(DependencyType)
  type: DependencyType;

  @ValidateNested()
  @Type(() => DependencyConditionDto)
  condition: DependencyConditionDto;

  @ValidateNested()
  @Type(() => DependencyActionDto)
  action: DependencyActionDto;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
