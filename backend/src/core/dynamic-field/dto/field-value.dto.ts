// src/core/dynamic-field/dto/field-value.dto.ts
import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveFieldValuesDto {
  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiProperty({ type: Object })
  @IsObject()
  values: Record<string, any>;
}
