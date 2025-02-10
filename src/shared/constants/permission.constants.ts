// 操作类型枚举
export enum OperationType {
    VIEW = 'view',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    APPROVE = 'approve',
    EXPORT = 'export',
    IMPORT = 'import',
    ALL = '*'
}

// 权限常量定义
export class Permissions {
    private static generatePermissions(module: string, subModule: string) {
        const prefix = `${module}:${subModule}`;
        return {
            ALL: `${prefix}:*`,
            VIEW: `${prefix}:view`,
            CREATE: `${prefix}:create`,
            UPDATE: `${prefix}:update`,
            DELETE: `${prefix}:delete`,
            APPROVE: `${prefix}:approve`,
            EXPORT: `${prefix}:export`,
            IMPORT: `${prefix}:import`,
        };
    }

    // 系统管理
    static readonly SYSTEM = {
        PREFIX: 'system',
        USER: { ASSIGN_ROLE: 'system:user:assign-role', ...this.generatePermissions('system', 'user') },
        ROLE: this.generatePermissions('system', 'role'),
        MENU: this.generatePermissions('system', 'menu'),
    };

    // 订单管理
    static readonly ORDER = {
        PREFIX: 'order',
        SALES: this.generatePermissions('order', 'sales'),
        PURCHASE: this.generatePermissions('order', 'purchase'),
    };

    // BOM管理
    static readonly BOM = {
        PREFIX: 'bom',
        LIST: this.generatePermissions('bom', 'list'),
        VERSION: this.generatePermissions('bom', 'version'),
    };

    // 供应商管理
    static readonly SUPPLIER = {
        PREFIX: 'supplier',
        BASE: this.generatePermissions('supplier', 'base'),
        ASSESSMENT: this.generatePermissions('supplier', 'assessment'),
    };

    // 获取所有权限列表
    static getAllPermissions(): { code: string; name: string; module: string }[] {
        const permissions: { code: string; name: string; module: string }[] = [];

        const processModule = (moduleObj: any, moduleName: string) => {
            Object.entries(moduleObj).forEach(([key, value]: [string, any]) => {
                if (key === 'PREFIX') return;

                if (typeof value === 'string') {
                    permissions.push({
                        code: value,
                        name: this.getPermissionName(value),
                        module: moduleName,
                    });
                } else {
                    Object.entries(value).forEach(([opKey, opValue]: [string, string]) => {
                        permissions.push({
                            code: opValue,
                            name: this.getPermissionName(opValue),
                            module: moduleName,
                        });
                    });
                }
            });
        };

        // 处理所有模块
        processModule(this.SYSTEM, 'system');
        processModule(this.ORDER, 'order');
        processModule(this.BOM, 'bom');
        processModule(this.SUPPLIER, 'supplier');

        return permissions;
    }

    // 获取权限显示名称
    private static getPermissionName(code: string): string {
        const parts = code.split(':');
        const module = parts[0];
        const subModule = parts[1];
        const operation = parts[2];

        const operationNames: Record<string, string> = {
            'view': '查看',
            'create': '创建',
            'update': '更新',
            'delete': '删除',
            'approve': '审批',
            'export': '导出',
            'import': '导入',
            '*': '所有',
            'assign-role': '分配角色'
        };

        const moduleNames: Record<string, string> = {
            'system': '系统',
            'order': '订单',
            'bom': 'BOM',
            'supplier': '供应商'
        };

        const subModuleNames: Record<string, string> = {
            'user': '用户',
            'role': '角色',
            'menu': '菜单',
            'sales': '销售',
            'purchase': '采购',
            'list': '清单',
            'version': '版本',
            'base': '基础',
            'assessment': '评估'
        };

        return `${moduleNames[module]}${subModuleNames[subModule]}${operationNames[operation]}`;
    }
}