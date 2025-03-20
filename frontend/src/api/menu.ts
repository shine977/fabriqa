/**
 * Menu API
 *
 * Contains API functions for menu CRUD operations
 */
import { httpService } from '../services/http/http.service';
import { ApiResponse, MultiItemsResponse, SingleItemResponse } from '../types';

// Type definitions
export enum MenuTypeEnum {
  DIRECTORY = 'DIRECTORY', // 目录
  MENU = 'MENU', // 菜单
  BUTTON = 'BUTTON', // 按钮
}

export interface MenuMetaDto {
  title?: string; // 菜单标题（国际化）
  icon?: string; // 菜单图标
  noCache?: boolean; // 是否缓存
  breadcrumb?: boolean; // 是否显示面包屑
  affix?: boolean; // 是否固定标签
  activeMenu?: string; // 高亮菜单
}

export interface MenuDto {
  redirect: string;
  title: string;
  id: string;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: MenuTypeEnum;
  isVisible: boolean;
  isActive: boolean;
  isEnabled: boolean;
  parentId?: string | null;
  orderNum: number;
  permission?: string;
  meta?: MenuMetaDto;
  children?: MenuDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuDto {
  name: string;
  path?: string;
  type: MenuTypeEnum;
  component?: string;
  icon?: string;
  orderNum?: number;
  permission?: string;
  isVisible?: boolean;
  isEnabled?: boolean;
  parentId?: string;
  meta?: MenuMetaDto;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface UpdateMenuOrderDto {
  id: string;
  orderNum: number;
}

const API_ENDPOINT = '/menu';

/**
 * Menu API functions
 */
export const menuApi = {
  /**
   * Get all menus (tree structure)
   * @returns Menu tree
   */
  getAllMenus: () => {
    return httpService.get<MultiItemsResponse<MenuDto>>(API_ENDPOINT);
  },

  /**
   * Get current user's menus
   * @returns User's menu tree
   */
  getUserMenus: () => {
    return httpService.get<MultiItemsResponse<MenuDto>>(`${API_ENDPOINT}/user-menus`);
  },

  /**
   * Get menu by ID
   * @param id Menu ID
   * @returns Menu details
   */
  getMenuById: (id: string) => {
    return httpService.get<SingleItemResponse<MenuDto>>(`${API_ENDPOINT}/${id}`);
  },

  /**
   * Create new menu
   * @param menu Menu data
   * @returns Created menu
   */
  createMenu: (menu: CreateMenuDto) => {
    return httpService.post<ApiResponse<MenuDto>>(API_ENDPOINT, menu);
  },

  /**
   * Update menu
   * @param id Menu ID
   * @param menu Menu data
   * @returns Updated menu
   */
  updateMenu: (id: string, menu: UpdateMenuDto) => {
    return httpService.patch<SingleItemResponse<MenuDto>>(`${API_ENDPOINT}/${id}`, menu);
  },

  /**
   * Delete menu
   * @param id Menu ID
   * @returns Success status
   */
  deleteMenu: (id: string) => {
    return httpService.delete<SingleItemResponse<null>>(`${API_ENDPOINT}/${id}`);
  },

  /**
   * Update menu order
   * @param orders Menu order data
   * @returns Success status
   */
  updateMenuOrder: (orders: UpdateMenuOrderDto[]) => {
    return httpService.post<SingleItemResponse<null>>(`${API_ENDPOINT}/order`, orders);
  },
};

export default menuApi;
