// src/decorator/require-permissions.decorator.ts
import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { PERMISSION_CHECKER_TYPE } from '@shared/enum/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_OPTIONS_KEY = 'permission_options';

export type PermissionOptions = [PERMISSION_CHECKER_TYPE?, string?];

export interface PermissionMetadata {
  permissions: string[];
  options?: string[];
}

/**
 * 权限要求装饰器
 * @param permissions 所需的权限代码列表
 * @param options 权限检查选项
 *
 * @example
 * // 需要同时具有 'user.create' 和 'user.edit' 权限
 * @RequirePermissions(['user.create', 'user.edit'])
 *
 * // 具有 'user.create' 或 'user.edit' 任意一个权限即可
 * @RequirePermissions(['user.create', 'user.edit'], { mode: PermissionCheckType.ANY })
 */
export const RequirePermissions = (
  permissions: string[],
  options: PermissionOptions = [PERMISSION_CHECKER_TYPE.ALL],
): CustomDecorator<string> => {
  return SetMetadata(PERMISSIONS_KEY, {
    permissions,
    options,
  });
};
