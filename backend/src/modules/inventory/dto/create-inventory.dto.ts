import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryStatus } from '../entities/inventory.entity';

export class CreateInventoryDto {
  @ApiProperty({ description: '库存数量', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: '可用数量', example: 100, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  availableQuantity?: number;

  @ApiProperty({ description: '预留数量', example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reservedQuantity?: number;

  @ApiProperty({ description: '最小库存量', example: 10, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number;

  @ApiProperty({ description: '最大库存量', example: 1000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxQuantity?: number;

  @ApiProperty({ description: '库存状态', enum: InventoryStatus, required: false })
  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @ApiProperty({ description: '库位', example: 'A-01-01', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: '批次号', example: 'BATCH-2025-001', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: '生产日期', example: '2025-01-01', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  productionDate?: Date;

  @ApiProperty({ description: '过期日期', example: '2026-01-01', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiProperty({ description: '单位成本', example: 10.5, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitCost?: number;

  @ApiProperty({ description: '总成本', example: 1050, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalCost?: number;

  @ApiProperty({ description: '备注', example: '初始库存', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ description: '工厂ID', example: '1' })
  @IsString()
  factoryId: string;

  @ApiProperty({ description: '物料ID', example: '1' })
  @IsString()
  materialId: string;

  @ApiProperty({ description: '动态字段', required: false })
  @IsOptional()
  dynamicFields?: Record<string, any>;
}
