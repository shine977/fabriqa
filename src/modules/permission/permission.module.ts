import { Module } from '@nestjs/common';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PermissionEntity } from './entities/permission.entity';
import { CacheModule } from '@core/cache';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PermissionEntity]),
    CacheModule.register({
      isGlobal: false,
      ttl: 300, // 5 minutes
    }),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService, TypeOrmModule],
})
export class PermissionModule {}
