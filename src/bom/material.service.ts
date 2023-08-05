import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialEntity } from './entities/material.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { ErrorCode } from 'src/config/code';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly materialRepo: Repository<MaterialEntity>,
  ) {}
  async create(createMaterialDto: CreateMaterialDto) {
    console.log('create', createMaterialDto);
    const materail = await this.materialRepo.findOne({
      where: { grade: createMaterialDto.grade },
    });

    if (materail) return unifyResponse(ErrorCode.code, '牌号已存在！');
    const item = await this.materialRepo.save(createMaterialDto);
    return unifyResponse({ item });
  }
  async findAll(query) {
    const qb = this.materialRepo.createQueryBuilder('materail');
    if (query.getParts) {
      qb.leftJoinAndSelect('materail.parts', 'parts', 'materail.id = parts.materialId ');
    }

    if (query.name) {
      qb.where(`material.name =:${query.name}`);
    }

    const [results, total] = await qb
      .offset((query.current - 1) * query.take)
      .limit(query.take)

      .getManyAndCount();

    return unifyResponse({ items: results, total });
  }

  async findOne(id: number) {
    const result = await this.materialRepo.find({ relations: ['parts'], where: { id } });
    return unifyResponse({ item: result });
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const { affected } = await this.materialRepo.update(id, updateMaterialDto);
    if (affected) {
      return unifyResponse(0, '更新成功');
    }
    throw new BadRequestException('更新失败');
  }

  async remove(id: number) {
    const { affected } = await this.materialRepo.softDelete(id);
    if (affected) {
      return unifyResponse(0, '删除成功');
    }
    throw new BadRequestException('删除失败');
  }
}
