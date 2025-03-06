// src/module/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PermissionSnapshotEntity } from '@modules/permission/entities/permission.snapshot.entity';
import { InitService } from './init.service';

import { InitPermissionService } from './init.permission.service';
import { InitRoleService } from './init.role.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity, PermissionSnapshotEntity]),
  ],
  providers: [InitService, InitRoleService, InitPermissionService],
  exports: [InitService, InitRoleService, InitPermissionService],
})
export class InitModule {}
