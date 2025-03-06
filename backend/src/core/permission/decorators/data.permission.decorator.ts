// src/decorator/data-permission.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { DataPermissionGuard } from 'src/core/permission/guards/data.permission.guard';
import { PermissionGuard } from 'src/core/permission/guards/permission.guard';


export const DATA_PERMISSION_KEY = 'data_permission';

// 数据权限类型
export enum DataPermissionType {
    TYPE = 'type',           // 类型权限（如用户类型）
    TENANT = 'tenant',       // 租户权限
    DEPARTMENT = 'department', // 部门权限
    ROLE = 'role',           // 角色权限
    OWNERSHIP = 'ownership',  // 数据所有权
    CUSTOM = 'custom'        // 自定义权限
}

// 数据操作类型
export enum DataOperationType {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    APPROVE = 'approve',
    EXPORT = 'export',
    IMPORT = 'import'
}

export interface DataPermissionRule<T = any> {
    type: DataPermissionType;
    operation: DataOperationType;
    resource: string;
    field?: string;  // 用于指定检查的字段
    condition?: (data: T, user: any) => boolean | Promise<boolean>;
    errorMessage?: string;
}

export const DataPermission = (rules: DataPermissionRule | DataPermissionRule[]) => 
    SetMetadata(DATA_PERMISSION_KEY, Array.isArray(rules) ? rules : [rules]);




/**
 * 数据权限装饰器，确保在基础权限检查之后执行
 * @param options 数据权限规则
 */
export function CheckDataPermission(rules: DataPermissionRule | DataPermissionRule[]) {
    return applyDecorators(
        SetMetadata(DATA_PERMISSION_KEY, Array.isArray(rules) ? rules : [rules]),
        UseGuards(PermissionGuard, DataPermissionGuard)
    );
}