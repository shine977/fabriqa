import { Module } from '@nestjs/common';
import { StatementService } from './statement.service';
import { StatementController } from './statement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementEntity } from './entities/statement.entity';
import { ContextService } from 'src/service/context.service';

@Module({
  controllers: [StatementController],
  providers: [StatementService, ContextService],
  imports: [TypeOrmModule.forFeature([StatementEntity])],
})
export class StatementModule { }
