import { Module } from '@nestjs/common';
import { StatementService } from './statement.service';
import { StatementController } from './statement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementEntity } from './entities/statement.entity';

@Module({
  controllers: [StatementController],
  providers: [StatementService],
  imports: [TypeOrmModule.forFeature([StatementEntity])],
})
export class StatementModule {}
