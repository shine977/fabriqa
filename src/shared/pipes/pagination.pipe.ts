// src/common/pipes/pagination.pipe.ts
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaginationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // 如果不是查询参数，直接返回
    if (metadata.type !== 'query') {
      return value;
    }

    const defaultPageSize = this.configService.get('pagination.defaultPageSize', 10);
    const maxPageSize = this.configService.get('pagination.maxPageSize', 100);
    const defaultCurrent = this.configService.get('pagination.defaultCurrent', 1);

    return {
      ...value,
      pageSize: Math.min(maxPageSize, Math.max(1, +(value.pageSize || defaultPageSize))),
      current: Math.max(1, +(value.current || defaultCurrent))
    };
  }
}