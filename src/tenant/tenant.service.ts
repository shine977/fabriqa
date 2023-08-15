import { Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';

@Injectable()
export class TenantService {
  constructor(@InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>) {}
  create(createTenantDto: CreateTenantDto) {
    return this.tenantRepo.save(createTenantDto);
  }

  async findAll() {
    const [items, total] = await this.tenantRepo.findAndCount();
    return unifyResponse({ items, total });
  }

  findOne(id: number) {
    return this.tenantRepo.findOne({ where: { id } });
  }
  findOneByName(name: string) {
    return this.tenantRepo.findOne({ where: { name } });
  }
  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
