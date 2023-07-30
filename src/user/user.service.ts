import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { encryptData } from 'src/common/utils/crypto';
import { JwtService } from '@nestjs/jwt';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { ErrorCode } from 'src/config/code';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(userDto: CreateUserDto) {
    let user = await this.userRepository.findOne({
      where: { username: userDto.username },
    });
    if (user) {
      return unifyResponse(`User ${user.username} is existed!`, ErrorCode.code);
    }

    userDto.password = encryptData(userDto.password);
    user = await this.userRepository.save(userDto);
    const token = this.jwtService.sign({
      sub: user.uid,
      username: user.username,
    });
    return { ...user, token };
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
}
