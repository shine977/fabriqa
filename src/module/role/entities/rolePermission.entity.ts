import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { RoleEntity } from './role.entity';
import { ResourceEntity } from 'src/module/resource/entities/resource.entity';
import { PermissioEntity } from 'src/module/permission/entities/permission.entity';

@Entity({ name: 'role_permission', orderBy: { created_at: 'DESC' } })
export class RolePermissionEnitity {
    @PrimaryColumn()
    roleId: number;

    @PrimaryColumn()
    permissionId: number;

    @PrimaryColumn()
    resourceId: number;

    @PrimaryColumn()
    menuId: number

    // @ManyToOne(() => RoleEntity, role => role.rolePermissions, { createForeignKeyConstraints: false })
    // @JoinColumn({ name: 'roleId' })
    // role: RoleEntity;

    // @ManyToOne(() => PermissioEntity, permission => permission.rolePermissions, { createForeignKeyConstraints: false })
    // @JoinColumn({ name: 'permissionId' })
    // permission: PermissioEntity;

    // @ManyToOne(() => ResourceEntity, resource => resource.rolePermissions, { createForeignKeyConstraints: false })
    // @JoinColumn({ name: 'resourceId' })
    // resource: ResourceEntity;

    // @ManyToOne(() => ResourceEntity, resource => resource.rolePermissions, { createForeignKeyConstraints: false })
    // @JoinColumn({ name: 'meunId' })
    // menu: ResourceEntity;
}