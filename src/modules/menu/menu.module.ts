import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { OperationLogEntity } from 'src/common/entity/operation-log.entity';
import { DataSource } from 'typeorm';
import { UserContextService } from 'src/core/context/user-context.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MenuEntity, UserEntity, RoleEntity, PermissionEntity, OperationLogEntity]),
    UserModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, UserContextService],
  exports: [MenuService],
})
export class MenuModule {}
