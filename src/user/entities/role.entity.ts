import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { MenuEntity } from './menu.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ name: 'role_id', type: 'varchar', length: 64 })
  roleId: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'role_menu',
    joinColumn: { name: 'uid' },
    inverseJoinColumn: { name: 'role_id' },
  })
  user: UserEntity[];

  @ManyToMany(() => MenuEntity, (user) => user.roles)
  // @JoinColumn({ name: 'menu_id' })
  menu: MenuEntity[];
}
