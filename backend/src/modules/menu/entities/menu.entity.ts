import { RoleEntity } from '@modules/role/entities/role.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/core/database/entities/base.entity';

import { Column, Entity, JoinTable, ManyToMany, Tree, TreeChildren, TreeParent } from 'typeorm';

export enum MenuTypeEnum {
  DIRECTORY = 'DIRECTORY', // 目录
  MENU = 'MENU', // 菜单
  BUTTON = 'BUTTON', // 按钮
}

@Entity({ name: 'menus' })
@Tree('closure-table')
export class MenuEntity extends BaseEntity {
  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @Column({ length: 100, nullable: true, comment: '菜单路由路径' })
  path: string;

  @Column({ length: 100, nullable: true, comment: '跳转' })
  redirect: string;

  @Column({ length: 100, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({ type: 'enum', enum: MenuTypeEnum, default: MenuTypeEnum.MENU, comment: '菜单类型' })
  type: MenuTypeEnum;

  @Column({ default: true, comment: '是否可见' })
  isVisible: boolean;

  @Column({ default: true, comment: '是否激活' })
  isActive: boolean;

  @Column({ default: true, comment: '是否启用' })
  isEnabled: boolean;

  @Column({ type: 'uuid', nullable: true, comment: '父菜单ID' })
  parentId: string | null;

  @Column({ name: 'order_num', default: 0, comment: '排序号' })
  orderNum: number;

  @Column({ length: 100, nullable: true, comment: '权限标识' })
  permission: string;

  @Column({ type: 'json', nullable: true, comment: '菜单元数据' })
  meta?: {
    title?: string; // 菜单标题（国际化）
    icon?: string; // 菜单图标
    noCache?: boolean; // 是否缓存
    breadcrumb?: boolean; // 是否显示面包屑
    affix?: boolean; // 是否固定标签
    activeMenu?: string; // 高亮菜单
  };

  @TreeParent()
  parent: MenuEntity;

  @TreeChildren()
  @Exclude({ toPlainOnly: true })
  children: MenuEntity[];

  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'roles_menu',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];
}
