// src/module/auth/permission.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PERMISSION_CHECKER_TYPE, PermissionScope } from '@shared/enum/permission.enum';

import { UserContextService } from 'src/core/context/user-context.service';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';

@Injectable()
export class PermissionCheckService {
  private readonly CACHE_TTL = 3600; // 1小时
  private readonly logger = new Logger(PermissionCheckService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // 缓存键生成
  private getCacheKey(type: string, userId: string, extra?: string): string {
    return `auth:${type}:${userId}${extra ? `:${extra}` : ''}`;
  }

  /**
   * 检查用户是否具有指定权限
   * @param userId 用户ID
   * @param permissionCode 权限代码
   * @param scope 权限范围（可选）
   */
  async hasPermission(userId: string, permissionCode: string, scope?: PermissionScope): Promise<boolean> {
    const cacheKey = this.getCacheKey('perm', userId, `${permissionCode}:${scope || 'default'}`);
    try {
      // 1. 检查缓存
      const cached = await this.cacheManager.get<boolean>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // 2. 数据库查询
      const result = await this.checkPermissionInDb(userId, permissionCode, scope);

      // 3. 更新缓存
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (error) {
      this.logger.error(`Permission check failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 批量检查权限
   * @param userId 用户ID
   * @param permissionCodes 权限代码数组
   * @param checkType 检查类型（ALL: 需要所有权限, ANY: 至少一个权限）
   */
  async hasPermissions(
    userId: string,
    permissionCodes: string[],
    checkType: PERMISSION_CHECKER_TYPE = PERMISSION_CHECKER_TYPE.ALL,
  ): Promise<boolean> {
    try {
      const results = await Promise.all(permissionCodes.map(code => this.hasPermission(userId, code)));

      return checkType === PERMISSION_CHECKER_TYPE.ALL ? results.every(Boolean) : results.some(Boolean);
    } catch (error) {
      this.logger.error(`Batch permission check failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 获取用户所有权限
   * @param userId 用户ID
   */
  async getUserPermissions(userId: string): Promise<PermissionEntity[]> {
    const cacheKey = this.getCacheKey('perms', userId);

    try {
      // 1. 检查缓存
      const cached = await this.cacheManager.get<PermissionEntity[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. 优化的SQL查询
      const permissions = await this.fetchUserPermissions(userId);

      // 3. 更新缓存
      await this.cacheManager.set(cacheKey, permissions, this.CACHE_TTL);

      return permissions;
    } catch (error) {
      this.logger.error(`Fetch permissions failed: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 获取用户角色
   * @param userId 用户ID
   */
  async getUserRoles(userId: string): Promise<RoleEntity[]> {
    const cacheKey = this.getCacheKey('roles', userId);

    try {
      // 1. 检查缓存
      const cached = await this.cacheManager.get<RoleEntity[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. 查询数据库
      const roles = await this.roleRepository
        .createQueryBuilder('role')
        .innerJoin('user_roles', 'ur', 'ur.role_id = role.id')
        .where('ur.user_id = :userId', { userId })
        .getMany();

      // 3. 更新缓存
      await this.cacheManager.set(cacheKey, roles, this.CACHE_TTL);

      return roles;
    } catch (error) {
      this.logger.error(`Fetch roles failed: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 清除用户权限缓存
   * @param userId 用户ID
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      const keys = [this.getCacheKey('perms', userId), this.getCacheKey('roles', userId)];

      await Promise.all(keys.map(key => this.cacheManager.del(key)));

      this.logger.debug(`Cleared cache for user ${userId}`);
    } catch (error) {
      this.logger.error(`Clear cache failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 检查数据库中的权限
   */
  private async checkPermissionInDb(userId: string, permissionCode: string, scope?: PermissionScope): Promise<boolean> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('1')
      .from(PermissionEntity, 'p')
      .leftJoin('role_permissions', 'rp', 'rp.permission_id = p.id')
      .leftJoin('user_roles', 'ur', 'ur.role_id = rp.role_id')
      .leftJoin('user_permissions', 'up', 'up.permission_id = p.id')
      .where('p.code = :code', { code: permissionCode })
      .andWhere('(ur.user_id = :userId OR up.user_id = :userId)', { userId });

    if (scope) {
      query.andWhere('p.scope = :scope', { scope });
    }

    const result = await query.limit(1).getRawOne();
    return !!result;
  }

  /**
   * 获取用户所有权限（包括角色权限和直接权限）
   */
  private async fetchUserPermissions(userId: string): Promise<PermissionEntity[]> {
    return this.dataSource
      .createQueryBuilder()
      .select('DISTINCT p.*')
      .from(PermissionEntity, 'p')
      .leftJoin('role_permissions', 'rp', 'rp.permission_id = p.id')
      .leftJoin('user_roles', 'ur', 'ur.role_id = rp.role_id')
      .leftJoin('user_permissions', 'up', 'up.permission_id = p.id')
      .where('ur.user_id = :userId OR up.user_id = :userId', { userId })
      .orderBy('p.code')
      .getRawMany();
  }

  /**
   * 同步用户权限（用于权限变更时）
   */
  async syncUserPermissions(userId: string): Promise<void> {
    try {
      await this.clearUserCache(userId);
      await this.getUserPermissions(userId); // 重新加载并缓存
      this.logger.debug(`Synced permissions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Sync permissions failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 从缓存获取数据
   * @param key 缓存键
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(
        `Cache retrieval failed for key ${key}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return null;
    }
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存时间（可选）
   */
  async setCachedData<T>(key: string, data: T, ttl: number = this.CACHE_TTL): Promise<void> {
    try {
      await this.cacheManager.set(key, data, ttl);
    } catch (error) {
      this.logger.error(
        `Cache setting failed for key ${key}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * 删除缓存数据
   * @param key 缓存键
   */
  async deleteCachedData(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(
        `Cache deletion failed for key ${key}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * 检查用户是否拥有指定权限
   * @param userId 用户ID
   * @param permissions 权限列表
   * @param checkerType 检查类型（ANY: 满足任一权限，ALL: 必须满足所有权限）
   * @returns 是否拥有权限
   */
  async check(
    userId: string,
    permissions: string[],
    checkerType: PERMISSION_CHECKER_TYPE = PERMISSION_CHECKER_TYPE.ANY,
  ): Promise<boolean> {
    // 获取用户角色和权限
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return false;
    }

    // 如果是超级管理员，直接返回true
    if (user.username === 'root') {
      return true;
    }

    // 获取用户所有角色的所有权限
    const userPermissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        userPermissions.add(permission.code);
      });
    });

    // 根据检查类型进行权限验证
    if (checkerType === PERMISSION_CHECKER_TYPE.ALL) {
      // ALL 类型：必须满足所有权限
      return permissions.every(permission => userPermissions.has(permission));
    } else if (checkerType === PERMISSION_CHECKER_TYPE.ANY) {
      // ANY 类型：满足任一权限即可
      return permissions.some(permission => userPermissions.has(permission));
    } else {
      // NONE 类型：不需要权限
      return true;
    }
  }

  /**
   * 检查用户是否拥有所有指定权限
   * @param userId 用户ID
   * @param permissions 权限列表
   * @returns 是否拥有所有权限
   */
  async checkAll(userId: string, permissions: string[]): Promise<boolean> {
    return this.check(userId, permissions, PERMISSION_CHECKER_TYPE.ALL);
  }

  /**
   * 检查用户是否拥有任一指定权限
   * @param userId 用户ID
   * @param permissions 权限列表
   * @returns 是否拥有任一权限
   */
  async checkAny(userId: string, permissions: string[]): Promise<boolean> {
    return this.check(userId, permissions, PERMISSION_CHECKER_TYPE.ANY);
  }
}
