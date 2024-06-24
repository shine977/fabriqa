import { Module } from '@nestjs/common';
import { PartService } from './component.service';
import { PartController } from './component.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlasticPartsEntity } from './entities/plasticParts.entity';

@Module({
  controllers: [PartController],
  providers: [PartService],
  imports: [TypeOrmModule.forFeature([PlasticPartsEntity])],
})
export class PartModule { }
