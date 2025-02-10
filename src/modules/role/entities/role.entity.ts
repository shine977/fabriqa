import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

import { PermissionEntity } from '@modules/permission/entities/permission.entity';

import { BaseEntity } from 'src/core/database/entities/base.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { MenuEntity } from '@modules/menu/entities/menu.entity';

@Entity({ name: 'role', orderBy: { createdAt: 'DESC' } })
export class RoleEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;

  @ManyToMany(() => UserEntity, {
    createForeignKeyConstraints: false,
  })
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, {
    createForeignKeyConstraints: false,
    eager: false,
  })
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: PermissionEntity[];

  @ManyToMany(() => MenuEntity, {
    createForeignKeyConstraints: false,
    eager: false,
  })
  @JoinTable({
    name: 'roles_menus',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'menu_id',
      referencedColumnName: 'id',
    },
  })
  menus: MenuEntity[];
}
