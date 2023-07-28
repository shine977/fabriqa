import { Module } from '@nestjs/common';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';

@Module({
  controllers: [PartController],
  providers: [PartService],
  imports: [TypeOrmModule.forFeature([Part])],
})
export class PartModule {}
