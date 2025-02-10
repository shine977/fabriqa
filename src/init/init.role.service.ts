import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Permissions } from 'src/shared/constants/permission.constants';
import { RoleEntity } from '@modules/role/entities/role.entity';

@Injectable()
export class InitRoleService implements OnModuleInit {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    await this.syncRoles();
  }

  async syncRoles() {
    const permissions = Permissions.getAllPermissions();
    const codes = permissions.map(p => p.code);

    // 一次性查询所有已存在的权限
    const existingRoles = await this.roleRepo.find({
      where: { code: In(codes) },
    });
    const existingCodes = new Set(existingRoles.map(p => p.code));

    // 区分需要更新和新增的权限
    const toUpdate = permissions.filter(p => existingCodes.has(p.code));
    const toCreate = permissions.filter(p => !existingCodes.has(p.code));
    // 批量创建新权限
    if (toCreate.length > 0) {
      // 先创建所有实体实例
      const roleEntities = toCreate.map(permission => {
        const role = this.roleRepo.create({
          code: permission.code,
          name: permission.name,
          description: permission.name,
          isEnabled: true,
          // uid: uuidv4()  // 为每个角色生成唯一的 uid
        });
        return role;
      });

      // 一次性保存所有实体
      await this.roleRepo.save(roleEntities);
    }

    // 批量更新已存在的权限
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map(permission =>
          this.roleRepo.update(
            { code: permission.code },
            {
              name: permission.name,
              description: permission.name,
              isEnabled: true,
            },
          ),
        ),
      );
    }

    // 清理不再使用的权限
    await this.roleRepo.delete({
      code: Not(In(codes)),
    });
  }
}
