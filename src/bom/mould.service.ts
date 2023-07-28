import { Injectable } from '@nestjs/common';
import { CreateMouldDto } from './dto/create-mould.dto';
import { UpdateMouldDto } from './dto/update-mould.dto';

@Injectable()
export class MouldService {
  create(createMouldDto: CreateMouldDto) {
    return 'This action adds a new mould';
  }

  findAll() {
    return `This action returns all mould`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mould`;
  }

  update(id: number, updateMouldDto: UpdateMouldDto) {
    return `This action updates a #${id} mould`;
  }

  remove(id: number) {
    return `This action removes a #${id} mould`;
  }
}
