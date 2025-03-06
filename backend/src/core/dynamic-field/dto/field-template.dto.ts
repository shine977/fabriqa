// src/core/dynamic-field/dto/field-template.dto.ts
import { IsString, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFieldDefinitionDto } from './field-definition.dto';

export class CreateFieldTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  moduleType: string;

  @ApiProperty({ type: [CreateFieldDefinitionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDefinitionDto)
  fields: CreateFieldDefinitionDto[];

  @IsString()
  @IsOptional()
  baseTemplateId?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystemDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateFieldTemplateDto extends CreateFieldTemplateDto {
  @ApiProperty()
  @IsString()
  id: string;
}
