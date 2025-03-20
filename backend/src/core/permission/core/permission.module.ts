import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, ModuleRef, Reflector } from '@nestjs/core';
import { PermissionCheckService } from './permission.check.service';
import { PermissionGuard } from '../guards/permission.guard';
import { DataPermissionGuard } from '../guards/data.permission.guard';

import { UserContextModule } from 'src/core/context/user-context.module';

import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { CacheModule } from '@core/cache';

/**
 * PermissionCoreModule
 *
 * 全局权限核心模块，负责：
 * 1. 权限检查服务
 * 2. 全局权限守卫
 * 3. 数据权限守卫
 * 4. 权限相关实体
 */
@Global()
@Module({
  imports: [
    UserContextModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([
      PermissionEntity,
      UserEntity,
      RoleEntity, // 角色实体也需要，因为权限检查可能涉及角色
    ]),
  ],
  providers: [
    // 提供 Reflector 服务
    {
      provide: Reflector,
      useClass: Reflector,
    },
    // 权限检查服务
    PermissionCheckService,
    // 全局权限守卫
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    // 数据权限守卫
    DataPermissionGuard,
  ],
  exports: [
    // 导出权限检查服务，供其他模块使用
    PermissionCheckService,
    // 导出数据权限守卫，供需要的模块使用
    DataPermissionGuard,
    // 导出 TypeORM 功能，允许其他模块访问权限相关实体
    TypeOrmModule,
  ],
})
export class PermissionCoreModule {}
