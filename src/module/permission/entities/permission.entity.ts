import { Entity, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';

import { PublicEntity } from 'src/common/entity/PublicEntity';
import { RolePermissionEnitity } from 'src/module/role/entities/rolePermission.entity';
import { TenantEntity } from 'src/module/tenant/entities/tenant.entity';
import { RoleEntity } from 'src/module/role/entities/role.entity';

@Entity({ name: 'permission', orderBy: { created_at: 'DESC' } })
export class PermissioEntity extends PublicEntity {
    @Column({ unique: true })
    name: string;

    @ManyToOne(() => TenantEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    // @OneToMany(() => RolePermissionEnitity, rolePermission => rolePermission.resource, { createForeignKeyConstraints: false })
    // rolePermissions: RolePermissionEnitity[];

    @ManyToMany(() => RoleEntity, role => role.permissions, { createForeignKeyConstraints: false })
    roles: RoleEntity[]
}