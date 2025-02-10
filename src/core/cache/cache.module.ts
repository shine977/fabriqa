import { DynamicModule, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export interface CacheModuleOptions {
  ttl?: number;
  max?: number;
  isGlobal?: boolean;
}

export interface RedisCacheOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions = {}): DynamicModule {
    const { isGlobal = false } = options;

    return {
      module: CacheModule,
      imports: [
        NestCacheModule.registerAsync<RedisOptions>({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const ttl = configService.get<number>('CACHE_TTL', 3600);
            const max = configService.get<number>('CACHE_MAX_ITEMS', 100);

            // 获取 Redis 配置
            const redisConfig: RedisCacheOptions = {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD', ''),
              db: configService.get('REDIS_DB', 0),
              keyPrefix: configService.get('REDIS_KEY_PREFIX', 'app:'),
            };

            // 检查是否配置了 Redis
            const useRedis = configService.get('USE_REDIS', 'true') === 'true';

            if (useRedis) {
              return {
                store: redisStore,
                ...redisConfig,
                ttl,
                max,
              };
            }

            // 如果未配置 Redis，使用内存缓存
            return {
              ttl,
              max,
            };
          },
          inject: [ConfigService],
          isGlobal,
        }),
      ],
      providers: [CacheService],
      exports: [CacheService],
      global: isGlobal,
    };
  }
}
