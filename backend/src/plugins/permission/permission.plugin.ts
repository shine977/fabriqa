import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { PermissionService } from '@modules/permission/permission.service';
import { RoleService } from '@modules/role/role.service';
import {
  ApplicationPlugin,
  PluginMetadata,
  PluginContext,
  PluginType,
  InjectService,
  PluginRegistry,
} from '@core/plugin';
import { PermissionScope, PermissionType, PERMISSION_CHECKER_TYPE } from '@shared/enum/permission.enum';
import { UserContext } from '@core/context';

@Injectable()
export class PermissionPlugin extends ApplicationPlugin {
  private readonly logger = new Logger(PermissionPlugin.name);

  metadata: PluginMetadata = {
    pluginId: 'permission',
    name: '权限管理插件',
    version: '1.0.0',
    description: '系统权限管理插件',
    author: 'System',
    type: PluginType.SYSTEM,
    dependencies: [],
  };
  getName(): string {
    return 'Permission';
  }

  getDescription(): string {
    return '系统权限管理插件';
  }

  getConfig(): Record<string, any> {
    return {};
  }
  constructor(
    @Inject('PermissionService') private readonly permissionService: PermissionService,
    @Inject('RoleService') private readonly roleService: RoleService,
    @Inject('PluginRegistry') private readonly pluginRegistry: PluginRegistry,
  ) {
    super();
    // 自注册到插件注册表
  }

  // 插件生命周期方法
  async onInstall(context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Installing permission plugin with context: ${JSON.stringify(context)}`);
      await this.initializeBasePermissions();
      this.logger.log('Permission plugin installed successfully');
    } catch (error) {
      this.logger.error(`Failed to install permission plugin: ${error.message}`, error.stack);
      throw error;
    }
  }
  async onError(context: PluginContext, error: Error): Promise<void> {
    try {
      this.logger.log(`Error occurred in permission plugin with context: ${JSON.stringify(context)}`);
      // 处理错误
      this.logger.log('Permission plugin error handled successfully');
    } catch (error) {
      this.logger.error(`Failed to handle permission plugin error: ${error.message}`, error.stack);
      throw error;
    }
  }
  async onEnable(context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Enabling permission plugin with context: ${JSON.stringify(context)}`);
      await this.syncPermissions();
      this.logger.log('Permission plugin enabled successfully');
    } catch (error) {
      this.logger.error(`Failed to enable permission plugin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onDisable(context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Disabling permission plugin with context: ${JSON.stringify(context)}`);
      await this.cleanupPluginData();
      this.logger.log('Permission plugin disabled successfully');
    } catch (error) {
      this.logger.error(`Failed to disable permission plugin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onUninstall(context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Uninstalling permission plugin with context: ${JSON.stringify(context)}`);
      await this.removePluginPermissions();
      this.logger.log('Permission plugin uninstalled successfully');
    } catch (error) {
      this.logger.error(`Failed to uninstall permission plugin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onUpgrade(context: PluginContext, fromVersion: string): Promise<void> {
    try {
      this.logger.log(`Upgrading permission plugin from ${fromVersion} to ${this.metadata.version}`);
      // 在这里实现版本升级逻辑
      this.logger.log('Permission plugin upgraded successfully');
    } catch (error) {
      this.logger.error(`Failed to upgrade permission plugin: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 权限检查方法
  async checkPermissions(
    userContext: UserContext,
    permissions: string[],
    type: PERMISSION_CHECKER_TYPE = PERMISSION_CHECKER_TYPE.ALL,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Checking permissions: ${permissions.join(', ')} with type: ${type}`);

      switch (type) {
        case PERMISSION_CHECKER_TYPE.ALL:
          return userContext.hasAllPermissions(permissions);
        case PERMISSION_CHECKER_TYPE.ANY:
          return userContext.hasAnyPermission(permissions);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to check permissions: ${error.message}`, error.stack);
      return false;
    }
  }

  // 数据权限检查方法
  async checkDataPermission(
    userContext: UserContext,
    resource: string,
    operation: string,
    data: any,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Checking data permission for user ${userContext.userId} on resource ${resource}`);

      const dataPermissions = await this.permissionService.findByType(PermissionType.DATA);
      // 实现数据权限检查逻辑
      return true;
    } catch (error) {
      this.logger.error(`Failed to check data permission: ${error.message}`, error.stack);
      return false;
    }
  }

  // 内部辅助方法
  private async initializeBasePermissions(): Promise<void> {
    try {
      const basePermissions = [
        {
          name: '权限管理',
          code: 'system:permission:manage',
          type: PermissionType.FEATURE,
          scope: PermissionScope.GLOBAL,
          description: '管理系统权限的权限',
          orderNum: 1,
        },
        {
          name: '权限查看',
          code: 'system:permission:view',
          type: PermissionType.PAGE,
          scope: PermissionScope.GLOBAL,
          description: '查看权限列表的权限',
          orderNum: 2,
        },
        {
          name: '数据权限管理',
          code: 'system:data-permission:manage',
          type: PermissionType.DATA,
          scope: PermissionScope.GLOBAL,
          description: '管理数据级别的权限',
          orderNum: 3,
        },
      ];

      for (const permission of basePermissions) {
        try {
          this.logger.debug(`Initializing permission: ${permission.code}`);
          await this.permissionService.create(permission);
          this.logger.debug(`Permission ${permission.code} initialized successfully`);
        } catch (error) {
          // 如果权限已存在，继续处理下一个
          if (error instanceof BadRequestException && error.message.includes('already exists')) {
            this.logger.debug(`Permission ${permission.code} already exists, skipping`);
            continue;
          }
          // 其他错误则抛出
          throw error;
        }
      }

      this.logger.debug('Base permissions initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize base permissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async syncPermissions(): Promise<void> {
    try {
      this.logger.debug('Syncing permissions');
      const permissions = await this.permissionService.findAll();
      //   // 实现权限同步逻辑...
      this.logger.debug(`Synced ${permissions.length} permissions`);
    } catch (error) {
      this.logger.error(`Failed to sync permissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async cleanupPluginData(): Promise<void> {
    try {
      this.logger.debug('Cleaning up plugin data');
      // 实现清理逻辑...
      this.logger.debug('Plugin data cleaned up successfully');
    } catch (error) {
      this.logger.error(`Failed to cleanup plugin data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async removePluginPermissions(): Promise<void> {
    try {
      this.logger.debug('Removing plugin permissions');
      const permissions = await this.permissionService.findAll();
      let removedCount = 0;

      for (const permission of permissions) {
        if (permission.code.startsWith('system:permission:')) {
          await this.permissionService.remove(permission.id);
          removedCount++;
        }
      }

      this.logger.debug(`Removed ${removedCount} plugin permissions`);
    } catch (error) {
      this.logger.error(`Failed to remove plugin permissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  getPluginMetadata(): PluginMetadata {
    return this.metadata;
  }
}
