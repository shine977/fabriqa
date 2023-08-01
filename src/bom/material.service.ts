import { Injectable } from '@nestjs/common';
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
    const materail = await this.materialRepo.findOne({
      where: { grade: createMaterialDto.grade },
    });

    if (materail) return unifyResponse(ErrorCode.code, '牌号已存在！');
    return this.materialRepo.save(createMaterialDto);
  }

  async findAll() {
    const [results, total] = await this.materialRepo.findAndCount({
      take: 10,
      skip: 0,
    });

    return unifyResponse({ items: results, total });
  }

  findOne(id: number) {
    return `This action returns a #${id} material`;
  }

  update(id: number, updateMaterialDto: UpdateMaterialDto) {
    return `This action updates a #${id} material`;
  }

  remove(id: number) {
    return `This action removes a #${id} material`;
  }
}
