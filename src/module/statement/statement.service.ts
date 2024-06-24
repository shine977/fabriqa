import { Injectable } from '@nestjs/common';
import { CreateStatementDto } from './dto/create-statement.dto';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StatementEntity } from './entities/statement.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { round, multiply } from 'mathjs';


@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private readonly StateRepo: Repository<StatementEntity>) { }
  create(createStatementDto: CreateStatementDto) {
    return this.StateRepo.save(createStatementDto);
  }
  async findAll(query) {
    const [results, total] = await this.StateRepo.createQueryBuilder('state')

      .leftJoinAndSelect('state.factory', 'factory')
      // .addSelect(`ROUND(state.unit_price * state.quantity, 2)`, `state.amount`)
      .offset((query.current - 1) * query.pageSize)
      .limit(query.pageSize)
      .getManyAndCount();
    console.log('results', results)
    const items = results.map((product) => ({
      ...product,
      // amount: Math.round((product.unitPrice * product.quantity + Number.EPSILON) * 100) / 100,
      amount: round(multiply(product.unitPrice, product.quantity), 3),
    }));
    return unifyResponse({ items, total });

  }

  findOne(id: number) {
    return `This action returns a #${id} statement`;
  }

  update(id: number, updateStatementDto: UpdateStatementDto) {
    return `This action updates a #${id} statement`;
  }

  remove(id: number) {
    return `This action removes a #${id} statement`;
  }
}
