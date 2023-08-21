import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { encryptData } from 'src/common/utils/crypto';

import { unifyResponse } from 'src/common/utils/unifyResponse';
import { MenuEntity } from './entities/menu.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}
  async create(user: CreateUserDto) {
    user.password = encryptData(user.password);
    return await this.userRepository.save(user);
  }

  async findAll(query) {
    const [results, total] = await this.userRepository.findAndCount({
      where: { username: Like(`%${query.username || ''}%`) },
      take: query.take,
      skip: (query.current - 1) * query.take,
    });
    return unifyResponse({ items: results, total });
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ uid: id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
  findOneByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }
  async findByUId(uid: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneOrFail({ where: { uid } });
  }
  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userRepository.update({ uid: userId }, { refreshToken });
  }
}
