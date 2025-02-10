import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { encryptAESData } from 'src/common/utils/crypto';

import { Repository } from 'typeorm';
import { InitRoleService } from './init.role.service';
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
    private readonly RoleSyncService: InitRoleService,
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.createSuperAdmin();
    await this.initRoles();
  }

  private async initRoles() {
    try {
      // check if roles data already exists
      const count = await this.roleRepository.count();
      if (count === 0) {
        this.logger.log('init roles...');
        await this.RoleSyncService.syncRoles();
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
          name: '超级管理员',
          isEnabled: true,
          description: '系统超级管理员，可以进行所有操作',
        });

        // 保存角色，这会触发生命周期事件 @BeforeInsert
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
        password: encryptAESData('Admin@4734081'),
        email: 'admin@example.com',
        type: UserTypeEnum.ROOT,
        isEnabled: true,
        roles: [superAdminRole],
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
