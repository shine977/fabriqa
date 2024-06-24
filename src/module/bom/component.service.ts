import { Inject, Injectable } from '@nestjs/common';
import { CreatePartDto } from './dto/create-component.dto';
import { UpdatePartDto } from './dto/update-component.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { PlasticPartsEntity } from './entities/plasticParts.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';

@Injectable()
export class PartService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PlasticPartsEntity) private readonly compReop: Repository<PlasticPartsEntity>,
  ) { }
  create(createPartDto: CreatePartDto) {
    return this.compReop.save({ tenantId: this.request.params.tenantId, ...createPartDto });
  }

  async findAll() {
    const [items, total] = await this.compReop.findAndCount();
    return unifyResponse({ items, total });
  }

  findOne(id: number) {
    return `This action returns a #${id} part`;
  }

  update(id: number, updatePartDto: UpdatePartDto) {
    return `This action updates a #${id} part`;
  }

  remove(id: number) {
    return `This action removes a #${id} part`;
  }
}
