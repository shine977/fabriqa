import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { PublicEntity } from 'src/common/entity/PublicEntity';
import { RolePermissionEnitity } from './rolePermission.entity';
import { UserRoleEntity } from 'src/module/user/entities/userRole.entity';

@Entity({ name: 'role', orderBy: { created_at: 'DESC' } })
export class RoleEntity extends PublicEntity {

    @Column()
    name: string;

    @OneToMany(() => UserRoleEntity, userRole => userRole.role)
    userRoles: UserRoleEntity[];

    @OneToMany(() => RolePermissionEnitity, rolePermission => rolePermission.role)
    rolePermissions: RolePermissionEnitity[];
}