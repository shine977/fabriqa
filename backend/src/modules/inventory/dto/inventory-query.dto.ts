import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryStatus } from '../entities/inventory.entity';

export class InventoryQueryDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  current?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiProperty({ description: '物料ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  materialId?: string;

  @ApiProperty({ description: '物料编码', example: 'M001', required: false })
  @IsString()
  @IsOptional()
  materialCode?: string;

  @ApiProperty({ description: '物料名称', example: '钢板', required: false })
  @IsString()
  @IsOptional()
  materialName?: string;

  @ApiProperty({ description: '工厂ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  factoryId?: string;

  @ApiProperty({ description: '库位', example: 'A-01-01', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: '批次号', example: 'BATCH-2025-001', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: '库存状态', enum: InventoryStatus, required: false })
  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @ApiProperty({ description: '是否库存不足', example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  isLow?: boolean;

  @ApiProperty({ description: '是否包含动态字段', example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  includeDynamicFields?: boolean;
}
