import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { PartModule } from './part.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService],
  imports: [PartModule, TypeOrmModule.forFeature([Material])],
})
export class MaterialModule {}
