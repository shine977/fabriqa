// src/core/dynamic-field/interfaces/field-cache.interface.ts

/**
 * Cache strategy types
 */
export enum CacheStrategy {
  NONE = 'none',
  MEMORY = 'memory',
  REDIS = 'redis',
  HYBRID = 'hybrid',
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number;
  maxSize?: number;
  prefix?: string;
}

/**
 * Cache key types
 */
export enum CacheKeyType {
  FIELD_DEFINITION = 'field_def',
  FIELD_VALUE = 'field_val',
  FIELD_TEMPLATE = 'field_tpl',
  FIELD_DEPENDENCY = 'field_dep',
  FIELD_FORMULA = 'field_formula',
}

/**
 * Cache context interface
 */
export interface CacheContext {
  tenantId: string;
  moduleId: string;
  entityId?: string;
  customerId?: string;
}
