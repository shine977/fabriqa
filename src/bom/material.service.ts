import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { ErrorCode } from 'src/config/code';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}
  async create(createMaterialDto: CreateMaterialDto) {
    const materail = await this.materialRepo.findOne({
      where: { grade: createMaterialDto.grade },
    });

    if (materail) return unifyResponse('牌号已存在！', ErrorCode.code);
    return this.materialRepo.save(createMaterialDto);
  }

  findAll() {
    return this.materialRepo.find();
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
