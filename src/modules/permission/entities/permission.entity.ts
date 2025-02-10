import { Entity, Column, ManyToMany, Index, Tree, TreeChildren, TreeParent } from 'typeorm';

import { RoleEntity } from '../../role/entities/role.entity';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { PermissionScope, PermissionType } from '@shared/enum/permission.enum';
import { BooleanTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'permission', orderBy: { createdAt: 'DESC' } })
@Tree('closure-table')
@Index(['code', 'type'], { unique: true })
export class PermissionEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: PermissionType, default: PermissionType.MENU })
  type: PermissionType;

  @Column({ type: 'enum', enum: PermissionScope, default: PermissionScope.GLOBAL })
  scope: PermissionScope;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_enabled', default: true, transformer: new BooleanTransformer() })
  isEnabled: boolean;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  component: string;

  @Column({ name: 'is_external', default: false })
  isExternal: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'is_cache', default: false })
  isCache: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'parent_id', comment: '父权限ID' })
  parentId: string | null;

  @TreeChildren()
  children: PermissionEntity[];

  @TreeParent()
  parent: PermissionEntity;

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];

  // 元数据，用于存储额外的配置信息
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}
