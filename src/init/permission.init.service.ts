import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Permissions } from '../shared/constants/permission.constants';
import { ConfigService } from '@nestjs/config';

import { PermissionScope, PermissionType } from '@shared/enum/permission.enum';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { PermissionSnapshotEntity } from '@modules/permission/entities/permission.snapshot.entity';
@Injectable()
export class PermissionInitService implements OnModuleInit {
  private readonly logger = new Logger(PermissionInitService.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(PermissionSnapshotEntity)
    private snapshotRepository: Repository<PermissionSnapshotEntity>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('PermissionInitService onModuleInit starting...');

    const initPermissions = this.configService.get('INIT_PERMISSIONS');
    this.logger.log(`INIT_PERMISSIONS config value: ${initPermissions}`);

    if (initPermissions === 'true') {
      this.logger.log('Starting permission initialization...');
      try {
        await this.initializePermissions();
        this.logger.log('Permission initialization completed successfully');
      } catch (error) {
        this.logger.error('Permission initialization failed', error.stack);
        throw error;
      }
    } else {
      this.logger.log('Permission initialization skipped (INIT_PERMISSIONS != true)');
    }
  }

  // 创建快照
  async createSnapshot(description: string, version: string) {
    const permissions = await this.permissionRepository.find();
    const snapshot = this.snapshotRepository.create({
      version,
      description,
      permissionData: permissions,
      createdAt: new Date(),
      isActive: true,
    });
    return await this.snapshotRepository.save(snapshot);
  }

  // 获取快照列表
  async getSnapshots() {
    return await this.snapshotRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 获取特定版本的快照
  async getSnapshot(version: string) {
    return await this.snapshotRepository.findOne({
      where: { version },
    });
  }

  // 从快照恢复
  async rollbackToVersion(targetVersion: string) {
    const snapshot = await this.snapshotRepository.findOne({
      where: { version: targetVersion },
    });

    if (!snapshot) {
      throw new Error(`Version ${targetVersion} not found`);
    }

    await this.dataSource.transaction(async manager => {
      // 创建回滚前的快照
      const currentPermissions = await this.permissionRepository.find();
      await this.snapshotRepository.save({
        version: `${snapshot.version}_rollback_backup_${Date.now()}`,
        permissionData: currentPermissions,
        created_at: new Date(),
        description: `Automatic backup before rolling back to version ${targetVersion}`,
        isActive: false,
        createdBy: 'system',
        metadata: {
          rollbackFrom: targetVersion,
          automatic: true,
        },
      });

      // 清除当前权限
      await manager.clear(PermissionEntity);

      // 恢复快照数据
      await manager.save(PermissionEntity, snapshot.permissionData);

      // 更新快照状态
      await this.snapshotRepository.update({}, { isActive: false });
      await this.snapshotRepository.update({ version: targetVersion }, { isActive: true });
    });

    this.logger.log(`Successfully rolled back to version: ${targetVersion}`);
  }

  // 删除快照
  async deleteSnapshot(version: string) {
    const snapshot = await this.snapshotRepository.findOne({
      where: { version },
    });

    if (!snapshot) {
      throw new Error(`Version ${snapshot} not found`);
    }

    if (snapshot.isActive) {
      throw new Error(`Cannot delete active snapshot: ${version}`);
    }

    await this.snapshotRepository.delete({ version });
    this.logger.log(`Deleted snapshot version: ${version}`);
  }

  async createPermissionIfNotExists(permissionData: Partial<PermissionEntity>) {
    const existing = await this.permissionRepository.findOne({
      where: { code: permissionData.code },
    });

    if (!existing) {
      const permission = this.permissionRepository.create({
        ...permissionData,
        isEnabled: true,
      });
      return await this.permissionRepository.save(permission);
    }
    return existing;
  }

  async initializePermissions(force: boolean = false) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查是否已经初始化过
      if (!force) {
        const count = await this.permissionRepository.count();
        if (count > 0) {
          this.logger.log('权限数据已存在，跳过初始化');
          return;
        }
      }

      // 系统管理权限
      await this.initSystemPermissions();
      // 订单管理权限
      await this.initOrderPermissions();
      // BOM管理权限
      await this.initBomPermissions();
      // 供应商管理权限
      await this.initSupplierPermissions();

      await queryRunner.commitTransaction();
      this.logger.log('权限初始化完成');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('权限初始化失败', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async initSystemPermissions() {
    // 系统管理根节点
    const systemRoot = await this.createPermissionIfNotExists({
      name: '系统管理',
      code: Permissions.SYSTEM.PREFIX,
      type: PermissionType.MENU,
      scope: PermissionScope.GLOBAL,
      orderNum: 1,

      path: '/system',
      component: 'Layout',
    });

    // 用户管理
    const userManagement = await this.createPermissionIfNotExists({
      name: '用户管理',
      code: Permissions.SYSTEM.USER.ALL,
      type: PermissionType.MENU,
      scope: PermissionScope.GLOBAL,
      orderNum: 1,

      path: 'user',
      component: '@/views/system/user/index',
      parent: systemRoot,
    });

    // 用户管理权限
    await Promise.all(
      Object.entries(Permissions.SYSTEM.USER)
        .filter(([key]) => key !== 'ALL')
        .map(([key, code]) =>
          this.createPermissionIfNotExists({
            name: this.getPermissionName('用户', key),
            code,
            type: PermissionType.API,
            scope: PermissionScope.GLOBAL,
            parent: userManagement,
          }),
        ),
    );

    // 角色管理
    const roleManagement = await this.createPermissionIfNotExists({
      name: '角色管理',
      code: Permissions.SYSTEM.ROLE.ALL,
      type: PermissionType.MENU,
      scope: PermissionScope.GLOBAL,
      orderNum: 2,
      path: 'role',
      component: '@/views/system/role/index',
      parent: systemRoot,
    });

    // 角色管理权限
    await Promise.all(
      Object.entries(Permissions.SYSTEM.ROLE)
        .filter(([key]) => key !== 'ALL')
        .map(([key, code]) =>
          this.createPermissionIfNotExists({
            name: this.getPermissionName('角色', key),
            code,
            type: PermissionType.API,
            scope: PermissionScope.GLOBAL,
            parent: roleManagement,
          }),
        ),
    );
  }

  private getPermissionName(module: string, operation: string): string {
    const operationMap = {
      VIEW: '查看',
      CREATE: '创建',
      UPDATE: '修改',
      DELETE: '删除',
      APPROVE: '审批',
      EXPORT: '导出',
      IMPORT: '导入',
    };
    return `${operationMap[operation]}${module}`;
  }

  private async initOrderPermissions() {
    // TODO: 实现订单管理权限初始化
    this.logger.log('订单管理权限初始化 - 待实现');
  }

  private async initBomPermissions() {
    // TODO: 实现BOM管理权限初始化
    this.logger.log('BOM管理权限初始化 - 待实现');
  }

  private async initSupplierPermissions() {
    // TODO: 实现供应商管理权限初始化
    this.logger.log('供应商管理权限初始化 - 待实现');
  }
}
