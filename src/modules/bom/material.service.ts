import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialEntity } from './entities/material.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { ErrorCode } from 'src/core/config/code.config';
import { ContextService } from 'src/service/context.service';

@Injectable()
export class MaterialService {
  constructor(
    private context: ContextService,
    @InjectRepository(MaterialEntity)
    private readonly materialRepo: Repository<MaterialEntity>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto) {
    const item = await this.materialRepo.save({ ...(await this.context.buildTenantCriteria()), ...createMaterialDto });
    return unifyResponse({ item });
  }
  async findAll(query) {
    const qb = this.materialRepo.createQueryBuilder('material');
    const criteria = await this.context.buildTenantCriteria();
    if (query.getParts) {
      qb.leftJoinAndSelect('materail.parts', 'parts', 'materail.id = parts.materialId');
    }

    if (query.name) {
      qb.where(`material.name =:${query.name}`);
    }

    qb.andWhere('material.tenant_id = :tenantId', { tenantId: criteria.tenantId });
    const [items, total] = await qb
      .offset((query.current - 1) * query.pageSize)
      .limit(query.take)

      .getManyAndCount();

    return unifyResponse({ items, total });
  }

  async findOne(id: number) {
    const result = await this.materialRepo.find({
      relations: ['component'],
      where: { ...(await this.context.buildTenantCriteria(id)) },
    });
    return unifyResponse({ item: result });
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const { affected } = await this.materialRepo.update(await this.context.buildTenantCriteria(id), updateMaterialDto);
    if (affected) {
      return unifyResponse(0, '更新成功');
    }
    throw new BadRequestException('更新失败');
  }

  async remove(id: number) {
    const { affected } = await this.materialRepo.softDelete(await this.context.buildTenantCriteria(id));
    if (affected) {
      return unifyResponse(0, '删除成功');
    }
    throw new BadRequestException('删除失败');
  }
}
