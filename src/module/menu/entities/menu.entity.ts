import { PublicEntity } from "src/common/entity/PublicEntity";
import { RolePermissionEnitity } from "src/module/role/entities/rolePermission.entity";
import { Entity, OneToMany } from "typeorm";

@Entity({ name: 'menus', orderBy: { created_at: 'DESC' } })
export class Menu extends PublicEntity {
    @OneToMany(() => RolePermissionEnitity, rolePermission => rolePermission.menu, { createForeignKeyConstraints: false })
    rolePermissions: RolePermissionEnitity[]
}
