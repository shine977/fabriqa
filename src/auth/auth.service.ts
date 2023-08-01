import { Injectable } from '@nestjs/common';

import { UserEntity } from 'src/user/entities/user.entity';

import { UnifySigleResponse, unifyResponse } from 'src/common/utils/unifyResponse';
import { CodeTips, ErrorCode } from 'src/config/code';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async authenticate(username: string): Promise<Partial<UserEntity> | UnifySigleResponse> {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      return unifyResponse(ErrorCode.code, CodeTips.c1001);
    }

    const token = this.jwtService.sign({
      username: user.username,
      sub: user.uid,
    });
    return unifyResponse({ item: { ...user, token } }, '注册成功');
  }
  async validateUser(uid: string) {
    return await this.userService.findByUId(uid);
  }
}
