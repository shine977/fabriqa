export enum MenuTypeEnum {
  DIRECTORY = 'DIRECTORY', // 目录
  MENU = 'MENU', // 菜单
  BUTTON = 'BUTTON', // 按钮
}

export interface MenuMetaDto {
  title?: string // 菜单标题（国际化）
  icon?: string // 菜单图标
  noCache?: boolean // 是否缓存
  breadcrumb?: boolean // 是否显示面包屑
  affix?: boolean // 是否固定标签
  activeMenu?: string // 高亮菜单
}
export interface MenuDto {
  redirect: string
  title: string
  id: string
  name: string
  path?: string
  component?: string
  icon?: string
  type: MenuTypeEnum
  isVisible: boolean
  isActive: boolean
  isEnabled: boolean
  parentId?: string | null
  orderNum: number
  permission?: string
  meta?: MenuMetaDto
  children?: MenuDto[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateMenuDto {
  name: string
  path?: string
  type: MenuTypeEnum
  component?: string
  icon?: string
  orderNum?: number
  permission?: string
  isVisible?: boolean
  isEnabled?: boolean
  parentId?: string
  meta?: MenuMetaDto
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface UpdateMenuOrderDto {
  id: string
  orderNum: number
}
