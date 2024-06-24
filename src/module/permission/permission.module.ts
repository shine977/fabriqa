import { Module } from '@nestjs/common';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PermissioEntity } from './entities/permission.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([PermissioEntity])],
    controllers: [PermissionController],
    providers: [PermissionService],
})
export class PermissionModule { }
