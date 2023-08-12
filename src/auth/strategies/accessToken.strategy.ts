import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private config: ConfigService) {
    console.log('JWT_ACCESS_SECRET', config.get('JWT_ACCESS_SECRET'));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }
  async validate(payload: any) {
    console.log('AccessTokenStrategy', payload);
    return await this.authService.validateUser(payload.sub);
  }
}
