import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceEntity } from './entities/resource.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ResourceEntity])],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule { }
