import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';

import { PublicEntity } from 'src/common/entity/PublicEntity';
import { RolePermissionEnitity } from './rolePermission.entity';
import { UserRoleEntity } from 'src/module/user/entities/userRole.entity';
import { UserEntity } from 'src/module/user/entities/user.entity';
import { PermissioEntity } from 'src/module/permission/entities/permission.entity';
import { MenuEntity } from 'src/module/menu/entities/menu.entity';

@Entity({ name: 'role', orderBy: { created_at: 'DESC' } })
export class RoleEntity extends PublicEntity {

    @Column()
    name: string;

    @OneToMany(() => UserRoleEntity, userRole => userRole.role)
    userRoles: UserRoleEntity[];

    // @OneToMany(() => RolePermissionEnitity, rolePermission => rolePermission.role)
    // rolePermissions: RolePermissionEnitity[];

    @ManyToMany(() => UserEntity, user => user.roles, { createForeignKeyConstraints: false })
    users: UserEntity[];

    @ManyToMany(() => PermissioEntity, permission => permission.roles, { createForeignKeyConstraints: false })
    @JoinTable()
    permissions: PermissioEntity[];

    @ManyToMany(() => MenuEntity, menu => menu.roles, { createForeignKeyConstraints: false })
    @JoinTable()
    menus: MenuEntity[];
}