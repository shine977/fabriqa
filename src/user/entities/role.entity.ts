import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { MenuEntity } from './menu.entity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ name: 'role_id', type: 'varchar', length: 64 })
  roleId: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.roles, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'role_user',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'uid' },
  })
  user: UserEntity[];

  @ManyToMany(() => MenuEntity, (menu) => menu.roles, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'role_menu',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'menu_id' },
  })
  menus: MenuEntity[];

  @ManyToMany(() => TenantEntity, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'role_tenant',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'tenant_id' },
  })
  tenant: TenantEntity[];
}
