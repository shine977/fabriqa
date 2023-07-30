import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRpository: Repository<User>,
  ) {}

  async getTokenForUser(username: string): Promise<User & { token: string }> {
    // const str = encryptData(
    //   JSON.stringify({
    //     username: user.username,
    //     sub: user.uid,
    //   }).toString(),
    // );

    const user = await this.userRpository.findOneBy({ username });

    const token = this.jwtService.sign({
      username: user.username,
      sub: user.uid,
    });
    console.log(token);
    return {
      ...user,
      token,
    };
  }
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }
}
