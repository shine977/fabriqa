import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, username: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        console.error('[LocalStrategy] Validation failed: user not found');
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log('[LocalStrategy] User validated successfully');
      return user;
    } catch (error) {
      console.error('[LocalStrategy] Validation error:', error.message);
      throw new UnauthorizedException(error.message);
    }
  }
}
