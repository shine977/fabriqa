import { Module } from '@nestjs/common';
import { MouldService } from './mould.service';
import { MouldController } from './mould.controller';
import { MaterialModule } from './material.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mould } from './entities/mould.entity';

@Module({
  controllers: [MouldController],
  providers: [MouldService],
  imports: [MaterialModule, TypeOrmModule.forFeature([Mould])],
})
export class MouldModule {}
