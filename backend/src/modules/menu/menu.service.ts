// src/module/menu/menu.service.ts
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In, Not, IsNull, Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserContextService } from '../../core/context/user-context.service';
import * as DataLoader from 'dataloader';
import { plainToInstance } from 'class-transformer';
import { unifyResponse } from '@shared/utils/unifyResponse';
import { BaseService, CacheService } from 'src/core/cache';

@Injectable()
export class MenuService extends BaseService {
  private readonly MENU_CACHE_KEY = 'system:menu:tree';
  private readonly USER_MENU_PREFIX = 'user:menu:';
  private readonly menuLoader: DataLoader<string, MenuEntity | null>;
  private readonly menusByRoleLoader: DataLoader<string, MenuEntity[]>;
  readonly logger = new Logger(MenuService.name);

  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(MenuEntity) private menuRepository: Repository<MenuEntity>,
    private dataSource: DataSource,
    private userContextService: UserContextService,
    protected cacheService: CacheService,
  ) {
    super(cacheService, 'menu');

    // 初始化单个菜单加载器
    this.menuLoader = new (DataLoader as any)(
      async (ids: readonly string[]) => {
        const menus = await this.menuRepository.find({
          where: { id: In([...ids]), isEnabled: true },
          order: { orderNum: 'ASC' },
        });
        return ids.map(id => menus.find(menu => menu.id === id) || null);
      },
      {
        cache: true,
        maxBatchSize: 100,
      },
    );

    // init role menu loader
    this.menusByRoleLoader = new (DataLoader as any)(
      async (roleIds: readonly string[]) => {
        const menus = await this.menuRepository
          .createQueryBuilder('menu')
          .leftJoinAndSelect('menu.roles', 'role')
          .where('role.id IN (:...roleIds)', { roleIds: [...roleIds] })
          .andWhere('menu.isEnabled = :isEnabled', { isEnabled: true })
          .orderBy('menu.orderNum', 'ASC')
          .getMany();

        return roleIds.map(roleId => menus.filter(menu => menu.roles?.some(role => role.id === roleId)) || []);
      },
      {
        cache: true,
        maxBatchSize: 50,
        cacheKeyFn: key => `role_${key}`,
      },
    );
  }

  async getUserMenus() {
    try {
      const user = this.userContextService.getContext();

      // 1. 尝试从缓存获取
      const cacheKey = `user:${user.id}:menus`;
      const cachedMenus = await this.getCacheData<MenuEntity[]>(cacheKey);
      if (cachedMenus) {
        return this.transformMenus(cachedMenus);
      }

      // 2. 获取菜单
      let menus: MenuEntity[];

      if (user.username === 'root') {
        // 超级管理员获取所有启用的菜单
        menus = await this.menuRepository.find({
          where: { isEnabled: true },
          order: { orderNum: 'ASC' },
        });
      } else {
        // 普通用户获取角色对应的菜单
        const userWithRoles = await this.userRepo.findOne({
          where: { id: user.id },
          relations: ['roles'],
        });

        if (!userWithRoles) {
          throw new NotFoundException('User not found');
        }

        // 使用 DataLoader 批量加载角色的菜单
        const roleMenusArrays = await Promise.all(
          userWithRoles.roles.filter(role => role.isEnabled).map(role => this.menusByRoleLoader.load(role.id)),
        );

        // 合并所有角色的菜单并去重
        menus = Array.from(new Set(roleMenusArrays.flat())).sort((a, b) => a.orderNum - b.orderNum);
      }

      // 3. 构建菜单树
      const menuTree = this.buildMenuTree(menus);

      // 4. 缓存结果
      await this.setCacheData(cacheKey, menuTree, 3600);

      return this.transformMenus(menuTree);
    } catch (error) {
      this.logger.error('Failed to get user menus:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get user menus');
    }
  }

  // 使用 DataLoader 加载单个菜单
  async getMenuById(id: string): Promise<MenuEntity | null> {
    return this.menuLoader.load(id);
  }

  // 使用 DataLoader 批量加载菜单
  async getMenusByIds(ids: string[]): Promise<MenuEntity[]> {
    try {
      const menus = await this.menuLoader.loadMany(ids);
      return menus.map(menu => (menu instanceof Error ? null : menu));
    } catch (error) {
      this.logger.error('Failed to load menus:', error);
      throw new BadRequestException('Failed to load menus');
    }
  }

  async create(createMenuDto: CreateMenuDto) {
    // 验证父级菜单
    if (createMenuDto.parentId) {
      const parent = await this.getMenuById(createMenuDto.parentId);
      if (!parent) {
        throw new BadRequestException('父级菜单不存在');
      }
      // 检查菜单层级
      const level = await this.getMenuLevel(parent);
      if (level >= 4) {
        throw new BadRequestException('菜单层级最多支持4级');
      }
      // 检查父级菜单类型
      if (parent.type === 'BUTTON') {
        throw new BadRequestException('按钮类型的菜单不能作为父级菜单');
      }
    }

    // 验证权限标识唯一性
    if (createMenuDto.permission) {
      const exists = await this.menuRepository.findOne({
        where: { permission: createMenuDto.permission },
      });
      if (exists) {
        throw new BadRequestException('权限标识已存在');
      }
    }

    const menu = plainToInstance(MenuEntity, createMenuDto);
    const savedMenu = await this.menuRepository.save(menu);
    return unifyResponse({ item: savedMenu });
  }

  async findAll() {
    return this.menuRepository.find({
      order: {
        orderNum: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    return this.getMenuById(id);
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id);
    if (!menu) {
      throw new NotFoundException(`Menu #${id} not found`);
    }

    // 验证父级菜单
    if (updateMenuDto.parentId) {
      const parent = await this.getMenuById(updateMenuDto.parentId);
      if (!parent) {
        throw new BadRequestException('父级菜单不存在');
      }
      // 检查是否将菜单移动到自己或其子菜单下
      if (await this.isChildMenu(id, updateMenuDto.parentId)) {
        throw new BadRequestException('不能将菜单移动到自己或其子菜单下');
      }
      // 检查菜单层级
      const level = await this.getMenuLevel(parent);
      if (level >= 4) {
        throw new BadRequestException('菜单层级最多支持4级');
      }
      // 检查父级菜单类型
      if (parent.type === 'BUTTON') {
        throw new BadRequestException('按钮类型的菜单不能作为父级菜单');
      }
    }

    // 验证权限标识唯一性
    if (updateMenuDto.permission) {
      const exists = await this.menuRepository.findOne({
        where: { permission: updateMenuDto.permission },
      });
      if (exists && exists.id !== id) {
        throw new BadRequestException('权限标识已存在');
      }
    }

    Object.assign(menu, updateMenuDto);
    return this.menuRepository.update(id, menu);
  }

  async remove(id: string) {
    const menu = await this.findOne(id);
    if (!menu) {
      throw new NotFoundException(`Menu #${id} not found`);
    }

    // 检查是否有子菜单
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestException('请先删除子菜单');
    }

    return this.menuRepository.softRemove({ id });
  }

  private async getMenuLevel(menu: MenuEntity): Promise<number> {
    let level = 1;
    let current = menu;

    while (current.parentId) {
      level++;
      current = await this.getMenuById(current.parentId);
      if (!current) break;
    }

    return level;
  }

  private async isChildMenu(parentId: string, childId: string): Promise<boolean> {
    const child = await this.getMenuById(childId);
    if (!child) return false;

    if (child.parentId === parentId) return true;

    if (child.parentId) {
      return this.isChildMenu(parentId, child.parentId);
    }

    return false;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const cacheKey = `${this.USER_MENU_PREFIX}${userId}:permissions`;
      const cached = await this.getCacheData<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 如果是超级管理员，返回所有权限
      if (user.username === 'root') {
        return ['*'];
      }

      // 获取用户所有启用的角色的权限
      const permissions = user.roles
        .filter(role => role.isEnabled)
        .flatMap(role => role.permissions || [])
        .filter(permission => permission.isEnabled)
        .map(permission => permission.code);

      // 去重
      const uniquePermissions = Array.from<string>(new Set(permissions));

      // 缓存结果
      await this.setCacheData(cacheKey, uniquePermissions, 3600);

      return uniquePermissions;
    } catch (error) {
      this.logger.error('Failed to get user permissions:', error);
      throw new BadRequestException('Failed to get user permissions');
    }
  }

  // 添加辅助方法用于构建树形结构
  private buildMenuTree(menus: MenuEntity[], parentId: string = null): MenuEntity[] {
    const tree: MenuEntity[] = [];
    menus.forEach(menu => {
      if (menu.parentId === parentId) {
        const children = this.buildMenuTree(menus, menu.id);
        if (children.length) {
          menu.children = children;
        }
        tree.push(menu);
      }
    });

    // 按 orderNum 字段排序
    return tree.sort((a, b) => a.orderNum - b.orderNum);
  }

  // 批量更新菜单排序
  async updateMenuOrder(orders: { id: number; orderNum: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const order of orders) {
        await this.menuRepository.update(order.id, {
          orderNum: order.orderNum,
        });
      }
      await queryRunner.commitTransaction();
      await this.clearMenuCache();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async clearMenuCache() {
    await this.clearModuleCache();
  }

  async clearModuleCache() {
    await this.cacheService.del(this.MENU_CACHE_KEY);
    const cacheKeysKey = 'menu:cache:keys';
    const cacheKeys = (await this.cacheService.get<string[]>(cacheKeysKey)) || [];
    await Promise.all(cacheKeys.map(key => this.cacheService.del(key)));
    await this.cacheService.del(cacheKeysKey);
  }

  // 缓存预热
  async warmUpCache() {
    const menus = await this.menuRepository.find({
      order: {
        orderNum: 'ASC',
      },
    });
    const trees = this.buildMenuTree(menus);
    await this.cacheService.set(this.MENU_CACHE_KEY, trees, 3600);
  }

  private transformMenus(menus: MenuEntity[]): MenuEntity[] {
    // 过滤掉禁用和不可见的菜单
    return menus
      .filter(menu => menu.isEnabled && menu.isVisible)
      .map(menu => {
        // 使用 plainToInstance 来正确创建 MenuEntity 实例
        const transformedMenu = plainToInstance(
          MenuEntity,
          {
            ...menu,
            children: menu.children ? this.transformMenus(menu.children) : [],
          },
          {
            enableCircularCheck: false,
            excludeExtraneousValues: false,
          },
        );

        // 调用 setCurrentUser 方法
        // transformedMenu.setCurrentUser();

        return transformedMenu;
      })
      .sort((a, b) => a.orderNum - b.orderNum);
  }
}
