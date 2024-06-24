import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEnitity } from './entities/rolePermission.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';


@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([RoleEntity, RolePermissionEnitity])],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule { }
