import { Injectable } from '@nestjs/common';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FactoryEntity } from './entities/factory.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from '@shared/utils/unifyResponse';
import { UserContext } from '@core/context';

@Injectable()
export class FactoryService {
  constructor(
    private context: UserContext,
    @InjectRepository(FactoryEntity) private readonly facRepo: Repository<FactoryEntity>,
  ) {}
  async create(createFactoryDto: CreateFactoryDto) {
    const item = this.facRepo.save({ ...(await this.context.buildTenantCriteria()), ...createFactoryDto });
    return unifyResponse({ item });
  }

  async findAll(query) {
    const criteria = await this.context.buildTenantCriteria();
    const qb = this.facRepo.createQueryBuilder('factory');

    qb.andWhere('factory.tenant_id =:tenantId', { tenantId: criteria.tenantId });
    const [items, total] = await qb
      .offset((query.current - 1) * query.pageSize)
      .limit(query.take)

      .getManyAndCount();

    return unifyResponse({ items, total });
  }

  async findOne(id: number) {
    console.log('findOne', await this.context.buildTenantCriteria(id));
    const item = await this.facRepo.find({
      relations: {
        components: true,
      },
      where: { ...(await this.context.buildTenantCriteria(id)) },
    });
    console.log(item);
    return unifyResponse({ item });
  }

  async update(id: number, updateFactoryDto: UpdateFactoryDto) {
    return this.facRepo.update(await this.context.buildTenantCriteria(id), updateFactoryDto);
  }

  async remove(id: number) {
    return this.facRepo.softDelete(await this.context.buildTenantCriteria(id));
  }
}
