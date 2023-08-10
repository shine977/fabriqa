import { Module } from '@nestjs/common';
import { MouldService } from './mold.service';
import { MouldController } from './mold.controller';
import { MaterialModule } from './material.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoldEntity } from './entities/mold.entity';

@Module({
  controllers: [MouldController],
  providers: [MouldService],
  imports: [MaterialModule, TypeOrmModule.forFeature([MoldEntity])],
})
export class MouldModule {}
