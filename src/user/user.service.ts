import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { encryptData } from 'src/common/utils/crypto';
import { JwtService } from '@nestjs/jwt';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { ErrorCode } from 'src/config/code';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async create(user: CreateUserDto) {
    user.password = encryptData(user.password);
    return await this.userRepository.save(this.userRepository.create(user));
  }

  findAll() {
    return this.userRepository.find();
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
}
