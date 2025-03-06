// src/modules/orders/dto/create-order-item.dto.ts
import { IsString, IsNumber, IsDate, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MATERIAL_TYPE } from '@shared/constants/order.constants';
import { Transform } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  materialNo: string;

  @ApiProperty()
  @IsString()
  materialCode: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: MATERIAL_TYPE })
  @IsEnum(MATERIAL_TYPE)
  material: MATERIAL_TYPE;

  @ApiProperty()
  @IsString()
  specification: string;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  delivery: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  dynamicFields?: Record<string, any>;
}
