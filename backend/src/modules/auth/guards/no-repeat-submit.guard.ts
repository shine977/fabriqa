import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NO_REPEAT_SUBMIT_KEY } from 'src/shared/decorators/no-repeat-submit';

@Injectable()
export class NoRepeatSubmitGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const timeout = this.reflector.get<number>(NO_REPEAT_SUBMIT_KEY, context.getHandler());

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) return true;

    const key = `repeat:${userId}:${request.method}:${request.url}`;
    const value = await this.cacheManager.get(key);
    console.log('防重复提交Key:', key);
    console.log('timeout值:', timeout);
    console.log('实际TTL(秒):', timeout / 1000);
    console.log('实际TTL(秒):', timeout / 1000);
    if (value) {
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.cacheManager.set(key, '1', 3);
    return true;
  }
}
