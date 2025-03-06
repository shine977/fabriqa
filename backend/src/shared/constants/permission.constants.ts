// src/shared/constants/permission.constants.ts
/**
 * Operation type enumeration for permission management
 */
export enum OperationType {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
  ALL = '*',
}

/**
 * Permission management class
 * Provides centralized permission definitions and utilities
 */
export class Permissions {
  /**
   * Generate standard CRUD permissions for a module
   * @param module Main module name
   * @param subModule Sub-module name
   * @returns Object containing all permission codes
   */
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

  // System Management
  static readonly SYSTEM = {
    PREFIX: 'system',
    ADMIN: {
      ...this.generatePermissions('system', 'admin'),
      SUPER: 'system:admin:super',
      GRANT: 'system:admin:grant',
      REVOKE: 'system:admin:revoke',
    },
    USER: {
      ASSIGN_ROLE: 'system:user:assign-role',
      ...this.generatePermissions('system', 'user'),
    },
    ROLE: this.generatePermissions('system', 'role'),
    MENU: this.generatePermissions('system', 'menu'),
  };

  // Order Management
  static readonly ORDER = {
    PREFIX: 'order',
    SALES: this.generatePermissions('order', 'sales'),
    PURCHASE: this.generatePermissions('order', 'purchase'),
  };

  // BOM Management
  static readonly BOM = {
    PREFIX: 'bom',
    LIST: this.generatePermissions('bom', 'list'),
    VERSION: this.generatePermissions('bom', 'version'),
  };

  // Supplier Management
  static readonly SUPPLIER = {
    PREFIX: 'supplier',
    BASE: this.generatePermissions('supplier', 'base'),
    ASSESSMENT: this.generatePermissions('supplier', 'assessment'),
  };

  // Authentication & Authorization
  static readonly AUTH = {
    PREFIX: 'auth',
    LOGIN: { ...this.generatePermissions('auth', 'login') },
    TOKEN: { ...this.generatePermissions('auth', 'token') },
  };

  // File Management
  static readonly FILE = {
    PREFIX: 'file',
    UPLOAD: { ...this.generatePermissions('file', 'upload') },
    DOWNLOAD: { ...this.generatePermissions('file', 'download') },
  };

  // Factory Management
  static readonly FACTORY = {
    PREFIX: 'factory',
    BASE: { ...this.generatePermissions('factory', 'base') },
    WORKSHOP: { ...this.generatePermissions('factory', 'workshop') },
  };

  // Receiving Management
  static readonly RECEIVING = {
    PREFIX: 'receiving',
    INSPECTION: { ...this.generatePermissions('receiving', 'inspection') },
    STORAGE: { ...this.generatePermissions('receiving', 'storage') },
  };

  // Delivery Management
  static readonly DELIVERY = {
    PREFIX: 'delivery',
    PLAN: { ...this.generatePermissions('delivery', 'plan') },
    TRACKING: { ...this.generatePermissions('delivery', 'tracking') },
  };

  // Statement Management
  static readonly STATEMENT = {
    PREFIX: 'statement',
    DAILY: { ...this.generatePermissions('statement', 'daily') },
    MONTHLY: { ...this.generatePermissions('statement', 'monthly') },
    ANNUAL: { ...this.generatePermissions('statement', 'annual') },
  };

  // Resource Management
  static readonly RESOURCE = {
    PREFIX: 'resource',
    EQUIPMENT: { ...this.generatePermissions('resource', 'equipment') },
    MATERIAL: { ...this.generatePermissions('resource', 'material') },
  };

  // Policy Management
  static readonly POLICY = {
    PREFIX: 'policy',
    RULES: { ...this.generatePermissions('policy', 'rules') },
    WORKFLOW: { ...this.generatePermissions('policy', 'workflow') },
  };

  /**
   * Get all permissions with their metadata
   * @returns Array of permission objects with code, name, and module information
   */
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

    // Process all modules
    processModule(this.SYSTEM, 'system');
    processModule(this.ORDER, 'order');
    processModule(this.BOM, 'bom');
    processModule(this.SUPPLIER, 'supplier');
    processModule(this.AUTH, 'auth');
    processModule(this.FILE, 'file');
    processModule(this.FACTORY, 'factory');
    processModule(this.RECEIVING, 'receiving');
    processModule(this.DELIVERY, 'delivery');
    processModule(this.STATEMENT, 'statement');
    processModule(this.RESOURCE, 'resource');
    processModule(this.POLICY, 'policy');

    return permissions;
  }

  /**
   * Get human-readable permission name
   * @param code Permission code
   * @returns Formatted permission name
   */
  private static getPermissionName(code: string): string {
    const parts = code.split(':');
    const module = this.getModuleName(parts[0]);
    const subModule = this.getSubModuleName(parts[1]);
    const operation = this.getOperationName(parts[2]);

    return `${module} ${subModule} ${operation}`;
  }

  /**
   * Get module display name
   * @param module Module code
   * @returns Module display name
   */
  private static getModuleName(module: string): string {
    const moduleNames: Record<string, string> = {
      system: '系统',
      order: '订单',
      bom: 'BOM',
      supplier: '供应商',
      auth: '认证',
      file: '文件',
      factory: '工厂',
      receiving: '收货',
      delivery: '发货',
      statement: '报表',
      resource: '资源',
      policy: '策略',
    };
    return moduleNames[module] || module;
  }

  /**
   * Get sub-module display name
   * @param subModule Sub-module code
   * @returns Sub-module display name
   */
  private static getSubModuleName(subModule: string): string {
    const subModuleNames: Record<string, string> = {
      user: '用户',
      role: '角色',
      menu: '菜单',
      sales: '销售',
      purchase: '采购',
      list: '列表',
      version: '版本',
      base: '基础',
      assessment: '评估',
      login: '登录',
      token: '令牌',
      upload: '上传',
      download: '下载',
      workshop: '车间',
      inspection: '检验',
      storage: '入库',
      plan: '计划',
      tracking: '跟踪',
      daily: '日报',
      monthly: '月报',
      annual: '年报',
      equipment: '设备',
      material: '物料',
      rules: '规则',
      workflow: '工作流',
      admin: '管理员',
    };
    return subModuleNames[subModule] || subModule;
  }

  /**
   * Get operation display name
   * @param operation Operation code
   * @returns Operation display name
   */
  private static getOperationName(operation: string): string {
    const operationNames: Record<string, string> = {
      view: '查看',
      create: '创建',
      update: '更新',
      delete: '删除',
      approve: '审批',
      export: '导出',
      import: '导入',
      '*': '全部',
      'assign-role': '分配角色',
      super: '超级管理员',
      grant: '授权',
      revoke: '撤销',
    };
    return operationNames[operation] || operation;
  }
}
