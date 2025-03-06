import { Module } from '@nestjs/common';
import { PartService } from './component.service';
import { PartController } from './component.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentEntity } from './entities/component.entity';

@Module({
  controllers: [PartController],
  providers: [PartService],
  imports: [TypeOrmModule.forFeature([ComponentEntity])],
})
export class PartModule {}
