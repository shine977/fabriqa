import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like, Not } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { MenuEntity } from '../menu/entities/menu.entity';

import { unifyResponse } from 'src/common/utils/unifyResponse';

import { UserContextService } from 'src/core/context/user-context.service';
import { BaseService, CacheService } from 'src/core/cache';
import { PluginService } from '@core/plugin';

@Injectable()
@PluginService()
export class RoleService extends BaseService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepo: Repository<MenuEntity>,
    private readonly dataSource: DataSource,
    protected readonly cacheService: CacheService,
    protected readonly userContextService: UserContextService,
  ) {
    super(cacheService, 'role'); // 传入缓存管理器和缓存前缀
  }

  async create(createRoleDto: CreateRoleDto) {
    // 检查权限
    if (!this.userContextService.isSuperAdmin() && !this.userContextService.hasPermission('role:create')) {
      throw new BadRequestException('没有创建角色的权限');
    }

    // 验证角色名和编码唯一性
    const exists = await this.roleRepo.findOne({
      where: [{ name: createRoleDto.name }, { code: createRoleDto.code }],
    });

    if (exists) {
      throw new BadRequestException('角色名称或编码已存在');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 创建角色
      const role = this.roleRepo.create(createRoleDto);

      // 如果有菜单ID，关联菜单
      if (createRoleDto.menuIds?.length) {
        const menus = await this.menuRepo.findByIds(createRoleDto.menuIds);
        role.menus = menus;
      }

      const savedRole = await queryRunner.manager.save(role);
      await queryRunner.commitTransaction();

      // 清除相关缓存
      await this.clearModuleCache();

      return unifyResponse({ item: savedRole });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query?: { name?: string; code?: string; isEnabled?: boolean }) {
    const cacheKey = `${this.cachePrefix}:list:${JSON.stringify(query)}`;

    // 使用基类方法获取缓存
    const cached = await this.getCacheData<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = {};
    if (query?.name) where['name'] = Like(`%${query.name}%`);
    if (query?.code) where['code'] = Like(`%${query.code}%`);
    if (query?.isEnabled !== undefined) where['isEnabled'] = query.isEnabled;

    const [roles, total] = await this.roleRepo.findAndCount({
      where,
      relations: ['menus'],
      order: { orderNum: 'ASC' },
    });

    const result = unifyResponse({ items: roles, total });

    // 使用基类方法设置缓存
    await this.setCacheData(cacheKey, result);

    return result;
  }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    return unifyResponse({ item: role });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    // 检查权限
    if (!this.userContextService.isSuperAdmin() && !this.userContextService.hasPermission('role:update')) {
      throw new BadRequestException('没有更新角色的权限');
    }

    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    // 检查名称和编码唯一性
    if (updateRoleDto.name || updateRoleDto.code) {
      const exists = await this.roleRepo.findOne({
        where: [
          { name: updateRoleDto.name, id: Not(id) },
          { code: updateRoleDto.code, id: Not(id) },
        ],
      });

      if (exists) {
        throw new BadRequestException('角色名称或编码已存在');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 更新基本信息
      Object.assign(role, updateRoleDto);

      // 更新菜单关联
      if (updateRoleDto.menuIds) {
        const menus = await this.menuRepo.findByIds(updateRoleDto.menuIds);
        role.menus = menus;
      }

      await queryRunner.manager.save(role);
      await queryRunner.commitTransaction();

      // 使用基类方法清理缓存
      await this.clearModuleCache();

      return unifyResponse('更新成功');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    // 检查权限
    if (!this.userContextService.isSuperAdmin() && !this.userContextService.hasPermission('role:delete')) {
      throw new BadRequestException('没有删除角色的权限');
    }

    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    // 检查是否有用户关联
    if (role.users?.length > 0) {
      throw new BadRequestException('该角色下还有用户，无法删除');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.roleRepo.softRemove(role);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.clearModuleCache();

    return unifyResponse('删除成功');
  }

  async deleteRoles(codes: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete roles not in the codes list with transaction
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(RoleEntity)
        .where('code NOT IN (:...codes)', { codes })
        .execute();

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
