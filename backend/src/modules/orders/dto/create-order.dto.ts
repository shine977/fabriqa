import { IsString, IsNumber, IsDate, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';
import { FindOperator } from 'typeorm';
import { ORDER_TYPE, ORDER_DIRECTION } from '@shared/constants/order.constants';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  taskOrderNo?: string;

  @IsOptional()
  @IsEnum(ORDER_DIRECTION)
  direction?: ORDER_DIRECTION;

  @IsOptional()
  @IsString()
  factoryId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  orderDate?: string;

  @IsOptional()
  @IsString()
  paymentTerm?: string;

  @IsOptional()
  @IsString()
  paymentClause?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  delivery?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  dynamicFields?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
