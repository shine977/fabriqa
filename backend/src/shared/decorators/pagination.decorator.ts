import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationOptions, PaginationResult } from 'src/common/types/pagination.interface';

export const Pagination = (options: PaginationOptions = {}) => {
  return createParamDecorator((data: unknown, ctx: ExecutionContext): PaginationResult => {
    const configService = ctx.switchToHttp().getRequest().app.get(ConfigService);
    
    // 合并配置优先级：默认值 < 全局配置 < 装饰器配置
    const globalOptions = {
      defaultPageSize: configService.get('pagination.defaultPageSize', 10),
      maxPageSize: configService.get('pagination.maxPageSize', 100),
      defaultCurrent: configService.get('pagination.defaultCurrent', 1),
    };

    const finalOptions = { ...globalOptions, ...options };
    const request = ctx.switchToHttp().getRequest();
    const query = request.query || {};

    return {
      pageSize: Math.min(
        finalOptions.maxPageSize,
        Math.max(1, +(query.pageSize || finalOptions.defaultPageSize))
      ),
      current: Math.max(1, +(query.current || finalOptions.defaultCurrent)),
      ...query,
    };
  })();
};