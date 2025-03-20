import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { JwtModule } from '@nestjs/jwt';

import { PermissionCoreModule } from 'src/core/permission/core/permission.module';
import { CacheModule } from '@core/cache';

/**
 * UserModule - 统一的用户模块
 *
 * 职责：
 * 1. 用户管理（CRUD操作）
 * 2. 用户认证（登录、注册）
 * 3. 用户授权（角色、权限）
 */
@Global()
@Module({
  imports: [
    ConfigModule,

    // JwtModule.register({}),
    // PermissionCoreModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
