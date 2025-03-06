import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';

@Injectable()
export class InitRoleService {
  private readonly logger = new Logger(InitRoleService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
  ) {}

  /**
   * Synchronize roles with existing permissions
   */
  async syncRoles() {
    try {
      this.logger.log('Starting role synchronization...');

      // Get all existing permissions from database
      const permissions = await this.permissionRepo.find({
        where: { isEnabled: true },
        select: ['id', 'code', 'name'],
      });

      if (permissions.length === 0) {
        this.logger.warn('No permissions found in database. Please run permission sync first.');
        return;
      }

      // Create default roles with their permissions
      const defaultRoles = [
        {
          code: 'super_admin',
          name: '超级管理员',
          description: '系统超级管理员，拥有所有权限',
          orderNum: 0,
          permissionFilter: (p: PermissionEntity) => true, // 所有权限
        },
        {
          code: 'admin',
          name: '管理员',
          description: '系统管理员，拥有大部分权限',
          orderNum: 1,
          permissionFilter: (p: PermissionEntity) =>
            !p.code.includes('system:admin:') && // 不包含超级管理员权限
            !p.code.includes('system:role:'), // 不包含角色管理权限
        },
        {
          code: 'user',
          name: '普通用户',
          description: '普通用户，拥有基本权限',
          orderNum: 2,
          permissionFilter: (p: PermissionEntity) =>
            p.code.startsWith('view:') || p.code.includes(':view') || p.code.includes(':read'),
        },
      ];

      // Sync each role
      for (const roleData of defaultRoles) {
        const { code, name, description, permissionFilter, orderNum } = roleData;

        // Find or create role
        let role = await this.roleRepo.findOne({
          where: { code },
          relations: ['permissions'],
        });

        const rolePermissions = permissions.filter(permissionFilter);

        if (!role) {
          // Create new role
          role = this.roleRepo.create({
            code,
            name,
            description,
            isEnabled: true,
            orderNum,
            permissions: rolePermissions,
          });
          await this.roleRepo.save(role);
          this.logger.log(`Created role: ${name}`);
        } else {
          // Update existing role's permissions
          role.permissions = rolePermissions;
          await this.roleRepo.save(role);
          this.logger.log(`Updated role permissions: ${name}`);
        }
      }

      this.logger.log('Role synchronization completed successfully');
    } catch (error) {
      this.logger.error('Role synchronization failed:', error);
      throw error;
    }
  }
}
