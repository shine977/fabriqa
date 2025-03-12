import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { encryptData } from '@shared/utils/crypto';

import { Repository } from 'typeorm';
import { InitRoleService } from './init.role.service';
import { InitPermissionService } from './init.permission.service';
import { UserEntity, UserTypeEnum } from '@modules/user/entities/user.entity';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';

@Injectable()
export class InitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
    private readonly roleSyncService: InitRoleService,
    private readonly permissionSyncService: InitPermissionService,
  ) {}

  async onApplicationBootstrap() {
    await this.initializeSystem();
  }

  /**
   * Initialize the system in the correct order:
   * 1. Sync permissions first
   * 2. Initialize roles with the synced permissions
   * 3. Create super admin with the initialized roles
   */
  private async initializeSystem() {
    try {
      this.logger.log('Starting system initialization...');

      // Step 1: Initialize permissions
      this.logger.log('Initializing permissions...');
      await this.permissionSyncService.syncPermissions();
      this.logger.log('Permissions initialization completed');

      // Step 2: Initialize roles
      await this.initRoles();

      // Step 3: Create super admin
      await this.createSuperAdmin();

      this.logger.log('System initialization completed successfully');
    } catch (error) {
      this.logger.error('System initialization failed:', error);
      throw error;
    }
  }

  private async initRoles() {
    try {
      // check if roles data already exists
      const count = await this.roleRepository.count();
      if (count === 0) {
        this.logger.log('init roles...');
        await this.roleSyncService.syncRoles();
        this.logger.log('init roles completed');
      } else {
        this.logger.log('roles data already exists, skip initialization');
      }
    } catch (error) {
      this.logger.error('roles data initialization failed', error);
      throw error;
    }
  }

  private async createSuperAdmin() {
    try {
      // create super admin role
      let superAdminRole = await this.roleRepository.findOne({
        where: { code: 'super_admin' },
      });

      if (!superAdminRole) {
        // create super admin role
        superAdminRole = this.roleRepository.create({
          code: 'super_admin',
          name: 'Super Admin',
          isEnabled: true,
          description: 'Super Admin role',
        });

        await this.roleRepository.save(superAdminRole);
        this.logger.log('super admin role created');
      }

      // check if super admin already exists
      const existingSuperAdmin = await this.userRepository.findOne({
        where: { username: 'root', type: UserTypeEnum.ROOT },
      });

      if (existingSuperAdmin) {
        this.logger.log('super admin already exists, skip creation');
        return;
      }

      // create super admin user entity instance
      const superAdmin = this.userRepository.create({
        username: 'root',
        password: encryptData('Admin@4734081', process.env.ENCRYPTION_KEY),
        email: 'admin@example.com',
        type: UserTypeEnum.ROOT,
        isEnabled: true,
        roles: [superAdminRole],
        tenantId: 'root',
      });

      // save user entity instance to database  @BeforeInsert
      await this.userRepository.save(superAdmin);

      this.logger.log('super admin created');
    } catch (error) {
      this.logger.error('super admin creation failed:', error);
      throw error;
    }
  }
}
