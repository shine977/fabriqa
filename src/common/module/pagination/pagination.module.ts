// src/common/modules/pagination/pagination.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { PaginationPipe } from './pagination.pipe';
import { PaginationOptions } from 'src/common/types/pagination.interface';

@Global()
@Module({})
export class PaginationModule {
  static forRoot(options: PaginationOptions = {}): DynamicModule {
    return {
      module: PaginationModule,
      providers: [
        {
          provide: 'PAGINATION_OPTIONS',
          useValue: {
            defaultPageSize: 10,
            maxPageSize: 100,
            defaultCurrent: 1,
            ...options,
          },
        },
        {
          provide: APP_PIPE,
          useClass: PaginationPipe,
        },
      ],
      exports: ['PAGINATION_OPTIONS'],
    };
  }
}