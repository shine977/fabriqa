import { Injectable } from '@nestjs/common';
import { CreateStatementDto } from './dto/create-statement.dto';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StatementEntity } from './entities/statement.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { round, multiply } from 'mathjs';
import { ContextService } from 'src/service/context.service';


@Injectable()
export class StatementService {
  constructor(
    private context: ContextService,
    @InjectRepository(StatementEntity) private readonly StateRepo: Repository<StatementEntity>) { }
  async create(createStatementDto: CreateStatementDto) {
    const criteria = await this.context.buildTenantCriteria()
    console.log(createStatementDto)
    const { unitPrice, quantity } = createStatementDto
    const item = await this.StateRepo.save({ ...criteria, amount: round(multiply(unitPrice, quantity), 3), ...createStatementDto })
    return unifyResponse({ item })
  }
  async findAll(query) {
    const [items, total] = await this.StateRepo.createQueryBuilder('state')
     
      .leftJoinAndSelect('state.factory', 'factory')
      // .addSelect(`ROUND(state.unit_price * state.quantity, 2)`, `state.amount`)
      .offset((query.current - 1) * query.pageSize)
      .limit(query.pageSize)
      .getManyAndCount();


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
