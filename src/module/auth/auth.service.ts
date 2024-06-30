import { ForbiddenException, Injectable } from '@nestjs/common';

import { UserEntity } from 'src/module/user/entities/user.entity';

import { UnifySigleResponse, unifyResponse } from 'src/common/utils/unifyResponse';
import { CodeTips, ErrorCode } from 'src/config/code';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/module/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configServie: ConfigService,
  ) { }

  async login(username: string): Promise<Partial<UserEntity> | UnifySigleResponse> {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      return unifyResponse(ErrorCode.code, CodeTips.c1001);
    }
    return this.authenticate(user);
  }
  async authenticate(user: UserEntity): Promise<Partial<UserEntity> | UnifySigleResponse> {
    const { accessToken, refreshToken } = await this.getTokens(user);
    await this.userService.updateRefreshToken(user.uid, refreshToken);
    return unifyResponse({ item: { ...user, accessToken, refreshToken } }, '注册成功');
  }
  async getTokens(user: UserEntity) {

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          username: user.username,
          sub: user.uid,
          tenantId: user.tenantId,
        },
        {
          secret: this.configServie.get('JWT_ACCESS_SECRET'),
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          username: user.username,
          sub: user.uid,
          tenantId: user.tenantId,
        },
        {
          secret: this.configServie.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async validateUser(username: string, pass: string) {
    const user = await this.userService.findOneByUsername(username)
    console.log('validateUser', user)
    if (user && user.password === pass) return user
    return null
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findByUId(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    if (refreshToken !== user.refreshToken) throw new ForbiddenException('Access Denied');
    const token = await this.getTokens(user);
    await this.userService.updateRefreshToken(userId, token.refreshToken);
    return token;
  }
}
