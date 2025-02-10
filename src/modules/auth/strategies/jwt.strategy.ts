import { forwardRef, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../services/auth.service';
import { AdvancedLog } from 'src/shared/decorators/advanced-logger.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    private config: ConfigService,
  ) {
    const jwtSecret = config.get<string>('JWT_ACCESS_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }
  onModuleInit() {
    console.log('JwtStrategy initialized');
  }
  @AdvancedLog({
    context: 'JWT validate Payload',
    // logParams: {
    //   result: true,
    // },
  })
  async validate(payload: any) {
    // 验证用户是否存在
    const user = await this.authService.findOneByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // 返回完整的用户信息
    return { ...user, ...payload };
  }
}
