import { Injectable } from '@nestjs/common';

import { CacheService } from './cache.service';
import { DEFAULT_CACHE_TTL } from './cache.constants';

@Injectable()
export abstract class BaseService {
  constructor(
    protected readonly cacheService: CacheService,
    protected readonly cachePrefix: string,
  ) {}

  /**
   * 添加缓存键到缓存键集合中
   */
  protected async addCacheKey(key: string) {
    const cacheKeysKey = `${this.cachePrefix}:cache:keys`;
    const cacheKeys = (await this.cacheService.get<string[]>(cacheKeysKey)) || [];
    if (!cacheKeys.includes(key)) {
      cacheKeys.push(key);
      await this.cacheService.set(cacheKeysKey, cacheKeys);
    }
  }

  /**
   * 清除模块所有缓存
   */
  protected async clearModuleCache() {
    const cacheKeysKey = `${this.cachePrefix}:cache:keys`;
    const cacheKeys = (await this.cacheService.get<string[]>(cacheKeysKey)) || [];

    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((key) => this.cacheService.del(key)));
      await this.cacheService.del(cacheKeysKey);
    }
  }

  /**
   * 获取缓存数据
   */
  protected async getCacheData<T>(key: string): Promise<T | undefined> {
    return this.cacheService.get<T>(key);
  }

  /**
   * 设置缓存数据
   */
  protected async setCacheData<T>(key: string, data: T, ttl: number = 3600) {
    await this.cacheService.set(key, data, ttl);
    await this.addCacheKey(key);
  }
}
