import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MenuService } from '../menu/menu.service';
import { MenuEntity } from '../menu/entities/menu.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthMenuService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly menuService: MenuService,
  ) {}

  async getUserMenusAndPermissions(userId: string) {
    const cacheKey = `user:menus:${userId}`;
    const cached = await this.cacheManager.get<{
      menus: MenuEntity[];
      permissions: string[];
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const [rawMenus, permissions] = await Promise.all([
      this.menuService.getUserMenus(),
      this.menuService.getUserPermissions(userId),
    ]);

    // 使用 plainToInstance 转换整个菜单数组
    const menus = plainToInstance(MenuEntity, rawMenus, {
      enableCircularCheck: false,
      excludeExtraneousValues: false,
    });

    // 确保每个菜单项都调用 setCurrentUser
    const setCurrentUserRecursively = (items: MenuEntity[]) => {
      // items.forEach(item => {
      //     item.setCurrentUser(userId);
      //     if (item.children?.length) {
      //         setCurrentUserRecursively(item.children);
      //     }
      // });
    };

    // 先设置用户上下文
    setCurrentUserRecursively(menus);

    // 然后进行转换
    const transformedMenus = this.transformMenus(menus);

    const result = {
      menus: transformedMenus,
      permissions,
    };

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  private transformMenus(menus: MenuEntity[]): MenuEntity[] {
    return menus
      .filter(menu => menu.isEnabled && menu.isVisible)
      .map(menu => {
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
        // transformedMenu.setCurrentUser();
        return transformedMenu;
      })
      .sort((a, b) => a.orderNum - b.orderNum);
  }

  async clearUserMenuCache(userId: string) {
    await this.cacheManager.del(`user:${userId}:menu_permissions`);
  }

  // 当用户角色或权限发生变化时调用此方法
  async refreshUserMenus(userId: string) {
    await this.clearUserMenuCache(userId);
    return this.getUserMenusAndPermissions(userId);
  }
}
