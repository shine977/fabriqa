import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/inventory-transaction.entity';

export class CreateInventoryTransactionDto {
  @ApiProperty({ description: '交易类型', enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ description: '交易数量', example: 10 })
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: '单位成本', example: 10.5, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitCost?: number;

  @ApiProperty({ description: '参考单号', example: 'PO-2025-001', required: false })
  @IsString()
  @IsOptional()
  referenceNo?: string;

  @ApiProperty({ description: '参考类型', example: 'purchase_order', required: false })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ description: '备注', example: '采购入库', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ description: '库存ID', example: '1' })
  @IsString()
  inventoryId: string;

  @ApiProperty({ description: '订单ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ description: '订单项ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  orderItemId?: string;

  @ApiProperty({ description: '源库位', example: 'A-01-01', required: false })
  @IsString()
  @IsOptional()
  sourceLocation?: string;

  @ApiProperty({ description: '目标库位', example: 'B-01-01', required: false })
  @IsString()
  @IsOptional()
  targetLocation?: string;

  @ApiProperty({ description: '动态字段', required: false })
  @IsOptional()
  dynamicFields?: Record<string, any>;
}
