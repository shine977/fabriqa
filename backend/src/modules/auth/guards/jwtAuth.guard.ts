// jwt-auth.guard.ts
import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

import { AdvancedLog } from 'src/shared/decorators/advanced-logger.decorator';
import { AUTH_TYPE_KEY } from 'src/shared/decorators/auth.type.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  @AdvancedLog({
    context: 'JwtAuthGuard canActivate',
    logParams: {
      result: true,
    },
  })
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const authType = this.reflector.get<string>(AUTH_TYPE_KEY, context.getHandler());
    if (authType === 'local') {
      console.log('JwtAuthGuard: Detected local strategy, skipping JWT check');
      return true;
    }
    return await (super.canActivate(context) as Promise<boolean>).catch((error) => {
      throw new UnauthorizedException(error.message);
    });
  }
}
