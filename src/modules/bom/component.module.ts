import { Module } from '@nestjs/common';
import { PartService } from './component.service';
import { PartController } from './component.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentEntity } from './entities/component.entity';
import { ContextService } from 'src/service/context.service';

@Module({
  controllers: [PartController],
  providers: [PartService, ContextService],
  imports: [TypeOrmModule.forFeature([ComponentEntity])],
})
export class PartModule { }
