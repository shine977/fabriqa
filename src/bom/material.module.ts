import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { PartModule } from './component.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEntity } from './entities/material.entity';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService],
  imports: [PartModule, TypeOrmModule.forFeature([MaterialEntity])],
})
export class MaterialModule {}
