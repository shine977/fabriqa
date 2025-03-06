// src/core/tenant/interceptors/tenant-query.interceptor.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  SelectQueryBuilder,
  ObjectLiteral,
  EntityTarget,
  EntitySchema,
} from 'typeorm';
import { UserContext } from '@core/context';
import { TenantBaseEntity } from '../tenant.entity';

@Injectable()
export class TenantQueryInterceptor {
  private static readonly logger = new Logger('TenantQueryInterceptor');
  private static readonly entityTenantCache = new Map<string, boolean>();

  private static isTenantEntity(entity: any): boolean {
    if (!entity) return false;

    // 处理构造函数和字符串类型
    const entityName = typeof entity === 'function' ? entity.name : entity;
    if (!entityName) return false;

    if (this.entityTenantCache.has(entityName)) {
      return this.entityTenantCache.get(entityName);
    }

    // 检查是否为租户实体
    const isTenant = typeof entity === 'function' && entity.prototype instanceof TenantBaseEntity;
    this.entityTenantCache.set(entityName, isTenant);
    return isTenant;
  }

  private static getEntityName(entity: EntityTarget<any>): string {
    if (typeof entity === 'function') {
      return entity.name;
    }
    if (typeof entity === 'string') {
      return entity;
    }
    if (entity instanceof EntitySchema) {
      return entity.options.name;
    }
    return (entity as { name: string }).name;
  }

  static initialize(dataSource: DataSource, userContext: UserContext) {
    const originalCreateQueryBuilder = EntityManager.prototype.createQueryBuilder;

    // 使用泛型来保持类型信息
    (EntityManager.prototype as any).createQueryBuilder = function <T extends ObjectLiteral>(
      this: EntityManager,
      entityOrRunner?: EntityTarget<T> | { type: Function } | string,
      alias?: string,
      queryRunner?: QueryRunner,
    ): SelectQueryBuilder<T> {
      let result: SelectQueryBuilder<T>;

      const isQueryRunner = entityOrRunner && typeof entityOrRunner === 'object' && 'connection' in entityOrRunner;

      if (!entityOrRunner || isQueryRunner) {
        result = originalCreateQueryBuilder.call(this, entityOrRunner);
      } else {
        const entity = entityOrRunner as EntityTarget<T>;
        result = originalCreateQueryBuilder.call(this, entity, alias, queryRunner);

        if (TenantQueryInterceptor.isTenantEntity(entity)) {
          const tenantId = userContext.tenantId;
          if (tenantId && alias) {
            result.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
            TenantQueryInterceptor.logger.debug(
              `Applied tenant filter for ${TenantQueryInterceptor.getEntityName(entity)}, tenantId: ${tenantId}`,
            );
          }
        }
      }

      return result;
    };

    // 优化 getRepository 的类型定义
    const originalGetRepository = EntityManager.prototype.getRepository;
    EntityManager.prototype.getRepository = function <T extends ObjectLiteral>(target: EntityTarget<T>) {
      const repository = originalGetRepository.call(this, target);

      if (TenantQueryInterceptor.isTenantEntity(target)) {
        const originalSave = repository.save.bind(repository);
        repository.save = async function (entities: T | T[], options?: any): Promise<T | T[]> {
          try {
            const tenantId = userContext.tenantId;

            if (Array.isArray(entities)) {
              entities.forEach(entity => {
                (entity as any).tenantId = tenantId;
                (entity as any).updatedBy = userContext.userId;
                if (!(entity as any).id) {
                  (entity as any).createdBy = userContext.userId;
                }
              });
            } else {
              (entities as any).tenantId = tenantId;
              (entities as any).updatedBy = userContext.userId;
              if (!(entities as any).id) {
                (entities as any).createdBy = userContext.userId;
              }
            }

            return originalSave(entities, options);
          } catch (error) {
            TenantQueryInterceptor.logger.error(`Error saving tenant entity: ${error.message}`, error.stack);
            throw error;
          }
        };
      }

      return repository;
    };

    this.logger.log('Tenant query interceptor initialized');
  }
}
