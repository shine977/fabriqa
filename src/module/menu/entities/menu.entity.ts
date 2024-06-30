import { PublicEntity } from "src/common/entity/PublicEntity";
import { RoleEntity } from "src/module/role/entities/role.entity";
import { RolePermissionEnitity } from "src/module/role/entities/rolePermission.entity";
import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

@Entity({ name: 'menus', orderBy: { created_at: 'DESC' } })
export class MenuEntity extends PublicEntity {
    // @OneToMany(() => RolePermissionEnitity, rolePermission => rolePermission.menu, { createForeignKeyConstraints: false })
    // rolePermissions: RolePermissionEnitity[]

    @ManyToMany(() => RoleEntity, role => role.menus, { createForeignKeyConstraints: false })
    @JoinTable()
    roles: RoleEntity[]
}
