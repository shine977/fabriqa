import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MenuEntity])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule { }
