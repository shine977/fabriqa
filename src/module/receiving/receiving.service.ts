import { Injectable } from '@nestjs/common';
import { CreateReceivingDto } from './dto/create-receiving.dto';
import { UpdateReceivingDto } from './dto/update-receiving.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextService } from 'src/service/context.service';
import { ReceivingEntity } from './entities/receiving.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { multiply, round } from 'mathjs';

@Injectable()
export class ReceivingService {
  constructor(
    private context: ContextService,
    @InjectRepository(ReceivingEntity) private readonly receiveRepo: Repository<ReceivingEntity>) { }
  async create(createStatementDto: CreateReceivingDto) {
    const criteria = await this.context.buildTenantCriteria()
    console.log(createStatementDto)
    const { unitPrice, quantity } = createStatementDto
    const item = await this.receiveRepo.save({ ...criteria, amount: round(multiply(unitPrice, quantity), 3), ...createStatementDto })
    return unifyResponse({ item })
  }
  async findAll(query) {
    const [items, total] = await this.receiveRepo.createQueryBuilder('receive')

      .leftJoinAndSelect('receive.factory', 'factory')
      // .addSelect(`ROUND(state.unit_price * state.quantity, 2)`, `state.amount`)
      .offset((query.current - 1) * query.pageSize)
      .limit(query.pageSize)
      .getManyAndCount();


    return unifyResponse({ items, total });

  }

  async findOne(id: number) {
    return this.receiveRepo.find({ where: { ...await this.context.buildTenantCriteria(id) } })
  }

  async update(id: number, updateReceivingDto: UpdateReceivingDto) {
    return this.receiveRepo.update(await this.context.buildTenantCriteria(id), updateReceivingDto)
  }

  async remove(id: number) {
    return this.receiveRepo.softDelete(await this.context.buildTenantCriteria(id))
  }
}
