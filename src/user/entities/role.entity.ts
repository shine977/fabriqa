import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { MenuEntity } from './menu.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends PublicEntity {
  @Column({ name: 'role_id', type: 'uuid', length: 64, generated: 'uuid' })
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

  // @ManyToMany(() => TenantEntity, { createForeignKeyConstraints: false })
  // @JoinTable({
  //   name: 'role_tenant',
  //   joinColumn: { name: 'role_id' },
  //   inverseJoinColumn: { name: 'tenant_id' },
  // })
  // tenant: TenantEntity[];
}
