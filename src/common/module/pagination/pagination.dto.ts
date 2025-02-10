// src/common/modules/pagination/pagination.dto.ts
import { Transform } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: '每页数量' })
  @IsOptional()
  @Min(1)
  pageSize: number;

  @ApiPropertyOptional({ description: '当前页码' })
  @IsOptional()
  @Min(1)
  current: number;

  // 添加其他通用查询参数
  @ApiPropertyOptional({ description: '搜索关键字' })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ description: '排序方向' })
  @IsOptional()
  order?: 'ASC' | 'DESC';
}