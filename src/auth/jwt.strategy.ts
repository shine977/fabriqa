import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private config: ConfigService) {
    console.log('config.get(jwt.secretOrPrivateKey)', config.get('jwt.secretOrPrivateKey'));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secretOrPrivateKey'),
    });
  }
  async validate(payload: any) {
    console.log(payload);
    return await this.authService.validateUser(payload.sub);
  }
}
