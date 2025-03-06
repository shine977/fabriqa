import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RoleEntity } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { MenuEntity } from '../menu/entities/menu.entity';
import { UserContextModule } from 'src/core/context/user-context.module';

@Module({
  imports: [UserContextModule, ConfigModule, TypeOrmModule.forFeature([RoleEntity, MenuEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
