import { Module } from '@nestjs/common';
import { ReceivingService } from './receiving.service';
import { ReceivingController } from './receiving.controller';
import { ContextService } from 'src/service/context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingEntity } from './entities/receiving.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivingEntity])],
  controllers: [ReceivingController],
  providers: [ReceivingService, ContextService],
})
export class ReceivingModule { }
