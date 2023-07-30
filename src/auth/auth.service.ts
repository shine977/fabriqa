import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UnifyResponse, unifyResponse } from 'src/common/utils/unifyResponse';
import { CodeTips, ErrorCode } from 'src/config/code';

@Injectable()
export class AuthService {
  constructor(
    // private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRpository: Repository<User>,
  ) {}

  async getTokenForUser(username: string): Promise<User | UnifyResponse> {
    const user = await this.userRpository.findOneBy({ username });
    if (!user) {
      return unifyResponse(CodeTips.c1001, ErrorCode.code);
    }
    // const token = this.jwtService.sign({
    //   username: user.username,
    //   sub: user.uid,
    // });
    return {
      ...user,
    };
  }
}
