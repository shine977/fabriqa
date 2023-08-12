import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { RoleEntity } from './entities/role.entity';
import { MenuEntity } from './entities/menu.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity, RoleEntity, MenuEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
