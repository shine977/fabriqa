export const PERMISSIONS_CHECK_RESULT = 'permissions_check_result';
export const PERMISSION_CACHE_PREFIX = 'perm:';
export const DATA_PERMISSION_CACHE_PREFIX = 'data_perm:';
export const CACHE_TTL = 3600; // 1小时缓存时间

// 权限检查结果类型
export enum PermissionCheckResult {
    PASSED = 'passed',
    FAILED = 'failed',
    SKIPPED = 'skipped'
}

// 权限缓存键生成器
export const generatePermissionCacheKey = (userId: number | string): string => 
    `${PERMISSION_CACHE_PREFIX}user:${userId}:permissions`;

export const generateDataPermissionCacheKey = (userId: number | string, resource: string): string => 
    `${DATA_PERMISSION_CACHE_PREFIX}user:${userId}:${resource}`;