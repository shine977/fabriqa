import { Inject, Injectable } from '@nestjs/common';
import { CreatePartDto } from './dto/create-component.dto';
import { UpdatePartDto } from './dto/update-component.dto';


import { InjectRepository } from '@nestjs/typeorm';
import { ComponentEntity } from './entities/component.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { REQUEST } from '@nestjs/core';
import { ContextService } from 'src/service/context.service';



@Injectable()
export class PartService {
  constructor(
    private context: ContextService,
    @InjectRepository(ComponentEntity) private readonly compReop: Repository<ComponentEntity>,
  ) { }


  async create(createPartDto: CreatePartDto, req) {
    const item = await this.compReop.save({ ...await this.context.buildTenantCriteria(), ...createPartDto });
    return unifyResponse({ item })
  }

  async findAll(query) {
    const criteria = await this.context.buildTenantCriteria()
    const qb = this.compReop.createQueryBuilder('component')
    qb.leftJoinAndSelect('component.material', 'material')
    qb.andWhere('component.tenant_id = :tenantId', { tenantId: criteria.tenantId })
    const [items, total] = await qb
      .offset((query.current - 1) * query.pageSize)
      .limit(query.take)
      .getManyAndCount();
    return unifyResponse({ items, total });
  }

  async findOne(id: number) {
    const item = await this.compReop.findOneBy(await this.context.buildTenantCriteria(id))
    return unifyResponse({ item })
  }

  async update(id: number, updatePartDto: UpdatePartDto) {
    const { affected } = await this.compReop.update(await this.context.buildTenantCriteria(id), updatePartDto)
    return affected ? unifyResponse(0) : unifyResponse(-1, 'failed')
  }

  async remove(id: number) {
    const { affected } = await this.compReop.delete(await this.context.buildTenantCriteria(id))
    return affected ? unifyResponse(0) : unifyResponse(-1, 'failed')
  }
}
