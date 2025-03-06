// src/core/dynamic-field/services/field-cache.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheStrategy, CacheConfig, CacheKeyType, CacheContext } from '../interfaces/field-cache.interface';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@core/cache';

@Injectable()
export class FieldCacheService {
  private readonly logger = new Logger(FieldCacheService.name);
  private readonly config: CacheConfig;
  private readonly localCache: Map<string, { value: any; expiry: number }>;

  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.config = {
      strategy: this.configService.get('CACHE_STRATEGY', CacheStrategy.MEMORY),
      ttl: this.configService.get('CACHE_TTL', 3600),
      maxSize: this.configService.get('CACHE_MAX_SIZE', 1000),
      prefix: this.configService.get('CACHE_PREFIX', 'field_cache'),
    };
    this.localCache = new Map();
  }

  /**
   * Generate cache key
   */
  private generateKey(type: CacheKeyType, context: CacheContext, ...additional: string[]): string {
    const parts = [this.config.prefix, type, context.tenantId, context.moduleId];

    if (context.entityId) {
      parts.push(context.entityId);
    }

    if (context.customerId) {
      parts.push(context.customerId);
    }

    return [...parts, ...additional].join(':');
  }

  /**
   * Get value from cache
   */
  async get<T>(type: CacheKeyType, context: CacheContext, ...additional: string[]): Promise<T | null> {
    const key = this.generateKey(type, context, ...additional);

    try {
      switch (this.config.strategy) {
        case CacheStrategy.MEMORY:
          return this.getFromLocalCache<T>(key);
        case CacheStrategy.REDIS:
          return this.getFromRedis<T>(key);
        case CacheStrategy.HYBRID:
          return await this.getFromHybridCache<T>(key);
        default:
          return null;
      }
    } catch (error) {
      this.logger.error(`Cache get error: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(
    type: CacheKeyType,
    context: CacheContext,
    value: any,
    ttl?: number,
    ...additional: string[]
  ): Promise<void> {
    const key = this.generateKey(type, context, ...additional);
    const effectiveTtl = ttl || this.config.ttl;

    try {
      switch (this.config.strategy) {
        case CacheStrategy.MEMORY:
          this.setInLocalCache(key, value, effectiveTtl);
          break;
        case CacheStrategy.REDIS:
          await this.setInRedis(key, value, effectiveTtl);
          break;
        case CacheStrategy.HYBRID:
          await this.setInHybridCache(key, value, effectiveTtl);
          break;
      }
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`, error.stack);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(type: CacheKeyType, context: CacheContext, ...additional: string[]): Promise<void> {
    const key = this.generateKey(type, context, ...additional);

    try {
      switch (this.config.strategy) {
        case CacheStrategy.MEMORY:
          this.localCache.delete(key);
          break;
        case CacheStrategy.REDIS:
          await this.cacheService.del(key);
          break;
        case CacheStrategy.HYBRID:
          this.localCache.delete(key);
          await this.cacheService.del(key);
          break;
      }
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`, error.stack);
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<void> {
    try {
      if (this.config.strategy === CacheStrategy.MEMORY || this.config.strategy === CacheStrategy.HYBRID) {
        this.clearLocalCacheByPattern(pattern);
      }

      if (this.config.strategy === CacheStrategy.REDIS || this.config.strategy === CacheStrategy.HYBRID) {
        await this.clearRedisCacheByPattern(pattern);
      }
    } catch (error) {
      this.logger.error(`Cache clear error: ${error.message}`, error.stack);
    }
  }

  /**
   * Get from local cache
   */
  private getFromLocalCache<T>(key: string): T | null {
    const item = this.localCache.get(key);
    if (!item) {
      return null;
    }

    if (item.expiry < Date.now()) {
      this.localCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Get from Redis cache
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    return this.cacheService.get<T>(key);
  }

  /**
   * Get from hybrid cache
   */
  private async getFromHybridCache<T>(key: string): Promise<T | null> {
    // Try local cache first
    const localValue = this.getFromLocalCache<T>(key);
    if (localValue) {
      return localValue;
    }

    // Try Redis cache
    const redisValue = await this.getFromRedis<T>(key);
    if (redisValue) {
      // Update local cache
      this.setInLocalCache(key, redisValue, this.config.ttl);
      return redisValue;
    }

    return null;
  }

  /**
   * Set in local cache
   */
  private setInLocalCache(key: string, value: any, ttl: number): void {
    // Implement LRU eviction if needed
    if (this.localCache.size >= (this.config.maxSize || 1000)) {
      const oldestKey = this.localCache.keys().next().value;
      this.localCache.delete(oldestKey);
    }

    this.localCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  /**
   * Set in Redis cache
   */
  private async setInRedis(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheService.set(key, value, ttl);
  }

  /**
   * Set in hybrid cache
   */
  private async setInHybridCache(key: string, value: any, ttl: number): Promise<void> {
    this.setInLocalCache(key, value, ttl);
    await this.setInRedis(key, value, ttl);
  }

  /**
   * Clear local cache by pattern
   */
  private clearLocalCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.localCache.keys()) {
      if (regex.test(key)) {
        this.localCache.delete(key);
      }
    }
  }

  /**
   * Clear Redis cache by pattern
   */
  private async clearRedisCacheByPattern(pattern: string): Promise<void> {
    try {
      const stores = this.cacheService.stores;
      const redisStore = stores?.find((store: any) => store.name === 'redis');

      if (redisStore?.client) {
        const keys = await redisStore.client.keys(pattern);
        if (keys.length > 0) {
          await redisStore.client.del(keys);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to clear Redis cache by pattern: ${error.message}`);
    }
  }
}
