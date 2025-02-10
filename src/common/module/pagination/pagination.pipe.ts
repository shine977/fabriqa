// src/common/modules/pagination/pagination.pipe.ts
import { Injectable, PipeTransform, ArgumentMetadata, Inject } from '@nestjs/common';
import { PaginationOptions } from '../../types/pagination.interface';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';


@Injectable()
export class PaginationPipe implements PipeTransform {
  constructor(
    @Inject('PAGINATION_OPTIONS')
    private options: PaginationOptions,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    // 使用 class-transformer 转换查询参数
    const paginationDto = plainToInstance(PaginationDto, {
      pageSize: Math.min(
        this.options.maxPageSize,
        Math.max(1, +(value.pageSize || this.options.defaultPageSize))
      ),
      current: Math.max(1, +(value.current || this.options.defaultCurrent)),
      ...value,
    });

    return paginationDto;
  }
}