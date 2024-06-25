import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RolePermissionEnitity } from './entities/rolePermission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEnitity) private readonly rolePerRepo: Repository<RolePermissionEnitity>) { }
  create(createRoleDto: CreateRoleDto) {
    return this.roleRepo.save(createRoleDto)
  }

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
