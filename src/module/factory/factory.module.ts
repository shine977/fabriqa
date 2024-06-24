import { Module } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { FactoryController } from './factory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactoryEntity } from './entities/factory.entity';

@Module({
  controllers: [FactoryController],
  providers: [FactoryService],
  imports: [TypeOrmModule.forFeature([FactoryEntity])],
})
export class FactoryModule {}
