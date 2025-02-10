// 权限检查类型
export enum PERMISSION_CHECKER_TYPE {
    ALL = 'all',  // 需要满足所有权限
    ANY = 'any',   // 满足任意一个权限即可
    NONE = 'none'  // 不需要满足任何权限
  }

/**
 * 权限类型
 * @description 定义系统中的权限类型
 */
export enum PermissionType {
  /**
   * 菜单权限
   * @description 用于控制菜单的显示和访问
   */
  MENU = 'menu',

  /**
   * 按钮权限
   * @description 用于控制按钮级别的操作权限
   */
  BUTTON = 'button',

  /**
   * API权限
   * @description 用于控制API接口的访问权限
   */
  API = 'api',

  /**
   * 页面权限
   * @description 用于控制整个页面的访问权限
   */
  PAGE = 'page',

  /**
   * 数据权限
   * @description 用于控制数据级别的访问权限
   */
  DATA = 'data',

  /**
   * 功能权限
   * @description 用于控制特定功能模块的访问权限
   */
  FEATURE = 'feature'
}

/**
 * 权限作用域
 * @description 定义权限的生效范围
 */
export enum PermissionScope {
  /**
   * 全局权限
   * @description 在整个系统范围内生效的权限
   */
  GLOBAL = 'global',

  /**
   * 租户权限
   * @description 仅在特定租户范围内生效的权限
   */
  TENANT = 'tenant',

  /**
   * 组织权限
   * @description 仅在特定组织范围内生效的权限
   */
  ORGANIZATION = 'organization',

  /**
   * 部门权限
   * @description 仅在特定部门范围内生效的权限
   */
  DEPARTMENT = 'department',

  /**
   * 用户权限
   * @description 仅对特定用户生效的权限
   */
  USER = 'user',

  /**
   * 项目权限
   * @description 仅在特定项目范围内生效的权限
   */
  PROJECT = 'project'
}