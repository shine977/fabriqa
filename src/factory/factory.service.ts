import { Injectable } from '@nestjs/common';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FactoryEntity } from './entities/factory.entity';
import { Repository } from 'typeorm';
import { unifyResponse } from 'src/common/utils/unifyResponse';

@Injectable()
export class FactoryService {
  constructor(@InjectRepository(FactoryEntity) private readonly facRepo: Repository<FactoryEntity>) {}
  create(createFactoryDto: CreateFactoryDto) {
    console.log('CreateFactoryDto');
    return this.facRepo.save(createFactoryDto);
  }

  async findAll() {
    const [items, total] = await this.facRepo.findAndCount({ take: 10, skip: 1 });
    return unifyResponse({ items, total });
  }

  findOne(id: number) {
    return `This action returns a #${id} factory`;
  }

  update(id: number, updateFactoryDto: UpdateFactoryDto) {
    return this.facRepo.update(id, updateFactoryDto);
  }

  remove(id: number) {
    return `This action removes a #${id} factory`;
  }
}
