import { PermissionType, PermissionScope } from '@shared/enum/permission.enum';

export interface PermissionDefinition {
  name: string;
  code: string;
  type: PermissionType;
  scope: PermissionScope;
  description?: string;
}

export interface PermissionPluginConfig {
  defaultScope: PermissionScope;
  cachePrefix: string;
  cacheTTL: number;
}
