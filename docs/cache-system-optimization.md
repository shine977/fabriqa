# Cache System Optimization

## Overview

This document provides a comprehensive overview of the cache system optimizations implemented in the project. The primary goal of these optimizations was to enhance the performance, maintainability, and scalability of the caching mechanism while adhering to best practices in NestJS and TypeORM.

## Key Improvements

### 1. Architecture Refactoring

- **Modular Design**: Refactored the caching system into a modular architecture with clear separation of concerns
- **Base Service Pattern**: Implemented an abstract base service to standardize cache operations across the application
- **Decorator-Based Configuration**: Utilized NestJS decorators for more elegant and type-safe cache configuration

### 2. Cache Module Implementation

Created a dedicated `CacheModule` with the following features:

- **Flexible Configuration**: Support for both memory-based and Redis-based caching
- **Environment-Based Settings**: Integration with ConfigService for environment-specific configuration
- **Async Registration**: Support for asynchronous module registration and configuration
- **Global Availability**: Option to register as a global module for application-wide availability

### 3. Performance Enhancements

- **DataLoader Integration**: Implemented DataLoader for batching and caching database requests
- **Optimized Cache Keys**: Standardized cache key generation with module-specific prefixes
- **TTL Management**: Configurable Time-To-Live (TTL) settings for different cache types
- **Bulk Operations**: Support for batch loading and caching to reduce database round trips

### 4. Type Safety Improvements

- **Strong Typing**: Enhanced TypeScript interfaces for all cache operations
- **Generic Methods**: Implemented generic methods for type-safe cache retrieval
- **Error Handling**: Improved error handling with proper TypeScript typing

## Implementation Details

### Core Components

#### 1. Cache Constants (`cache.constants.ts`)

Central location for cache-related constants:

```typescript
export const CACHE_PREFIX_METADATA = 'cache:prefix';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const DEFAULT_CACHE_TTL = 3600; // 1 hour
```

#### 2. Cache Service (`cache.service.ts`)

Service providing the core caching functionality:

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}
```

#### 3. Base Cache Service (`base.cache.service.ts`)

Abstract base class providing standardized caching operations:

```typescript
@Injectable()
export abstract class BaseService {
  @Inject(CACHE_MANAGER)
  protected readonly cacheManager: Cache;
    
  protected abstract readonly cachePrefix: string;

  protected async addCacheKey(key: string) {
    const cacheKeysKey = `${this.cachePrefix}:cache:keys`;
    const cacheKeys = await this.cacheManager.get<string[]>(cacheKeysKey) || [];
    if (!cacheKeys.includes(key)) {
      cacheKeys.push(key);
      await this.cacheManager.set(cacheKeysKey, cacheKeys);
    }
  }

  protected async clearModuleCache() {
    const cacheKeysKey = `${this.cachePrefix}:cache:keys`;
    const cacheKeys = await this.cacheManager.get<string[]>(cacheKeysKey) || [];

    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
      await this.cacheManager.del(cacheKeysKey);
    }
  }

  protected async getCacheData<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  protected async setCacheData<T>(key: string, data: T, ttl: number = 3600) {
    await this.cacheManager.set(key, data, ttl);
    await this.addCacheKey(key);
  }
}
```

#### 4. Cache Module (`cache.module.ts`)

NestJS module for configuring and providing cache functionality:

```typescript
@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions = {}): DynamicModule {
    const { isGlobal = false } = options;

    return {
      module: CacheModule,
      imports: [
        NestCacheModule.registerAsync<RedisClientOptions>({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const ttl = configService.get<number>('CACHE_TTL', 3600);
            const max = configService.get<number>('CACHE_MAX_ITEMS', 100);
            
            // Redis configuration
            const redisConfig: RedisCacheOptions = {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD', ''),
              db: configService.get('REDIS_DB', 0),
              keyPrefix: configService.get('REDIS_KEY_PREFIX', 'app:'),
            };

            const useRedis = configService.get('USE_REDIS', 'true') === 'true';

            if (useRedis) {
              return {
                store: redisStore,
                ...redisConfig,
                ttl,
                max,
              };
            }

            return { ttl, max };
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

  static registerAsync(options): DynamicModule {
    // Implementation for async registration
    // ...
  }
}
```

### DataLoader Implementation

Enhanced the MenuService with DataLoader for efficient data loading:

```typescript
export class MenuService extends BaseService {
  private readonly menuLoader: DataLoader<string, MenuEntity | null>;
  private readonly menusByRoleLoader: DataLoader<string, MenuEntity[]>;
  
  protected readonly cachePrefix = 'menu';

  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(MenuEntity) private menuRepository: Repository<MenuEntity>,
    private dataSource: DataSource,
    private userContextService: UserContextService,
  ) {
    super();

    // Initialize single menu loader
    this.menuLoader = new (DataLoader as any)(
      async (ids: readonly string[]) => {
        const menus = await this.menuRepository.find({
          where: { id: In([...ids]), isEnabled: true },
          order: { orderNum: 'ASC' },
        });
        return ids.map(id => menus.find(menu => menu.id === id) || null);
      },
      {
        cache: true,
        maxBatchSize: 100,
      }
    );

    // Initialize role menu loader
    this.menusByRoleLoader = new (DataLoader as any)(
      async (roleIds: readonly string[]) => {
        const menus = await this.menuRepository
          .createQueryBuilder('menu')
          .leftJoinAndSelect('menu.roles', 'role')
          .where('role.id IN (:...roleIds)', { roleIds: [...roleIds] })
          .andWhere('menu.isEnabled = :isEnabled', { isEnabled: true })
          .orderBy('menu.orderNum', 'ASC')
          .getMany();

        return roleIds.map(roleId => 
          menus.filter(menu => 
            menu.roles?.some(role => role.id === roleId)
          ) || []
        );
      },
      {
        cache: true,
        maxBatchSize: 50,
        cacheKeyFn: key => `role_${key}`,
      }
    );
  }

  // DataLoader methods
  async getMenuById(id: string): Promise<MenuEntity | null> {
    try {
      return await this.menuLoader.load(id);
    } catch (error) {
      this.logger.error(`Failed to load menu with id ${id}:`, error);
      return null;
    }
  }

  async getMenusByIds(ids: string[]): Promise<(MenuEntity | null)[]> {
    try {
      const menus = await this.menuLoader.loadMany(ids);
      return menus.map(menu => menu instanceof Error ? null : menu);
    } catch (error) {
      this.logger.error('Failed to load menus:', error);
      throw new BadRequestException('Failed to load menus');
    }
  }
}
```

## Configuration

### Environment Variables

The cache system uses the following environment variables:

```
# Cache Configuration
CACHE_TTL=3600
CACHE_MAX_ITEMS=100
USE_REDIS=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_KEY_PREFIX=app:
```

### Module Registration

Example of registering the CacheModule in the AppModule:

```typescript
@Module({
  imports: [
    // Simple configuration
    CacheModule.register({
      isGlobal: true,
    }),
    
    // Or with async configuration
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('CACHE_TTL', 3600),
        max: configService.get('CACHE_MAX_ITEMS', 100),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Best Practices

### Cache Key Management

- Use module-specific prefixes for all cache keys
- Track cache keys to enable efficient cache clearing
- Use consistent naming conventions for cache keys

### Error Handling

- Always wrap cache operations in try-catch blocks
- Provide meaningful error messages
- Add appropriate logging for cache-related errors

### Type Safety

- Use generics for type-safe cache operations
- Define interfaces for all cache-related data structures
- Leverage TypeScript's type system for better IDE support

### Performance Tips

- Batch related database queries using DataLoader
- Set appropriate TTL values based on data volatility
- Consider cache size limits to prevent memory issues
- Use cache key prefixes to organize and manage cache entries

## Conclusion

The refactored cache system provides significant performance improvements and enhances code maintainability. It leverages modern NestJS features and follows best practices for enterprise-level applications. The modular design allows for easy extension and customization while maintaining type safety and performance.

Future enhancements could include more sophisticated cache invalidation strategies, cache analytics, and integration with distributed caching systems for high-availability deployments.