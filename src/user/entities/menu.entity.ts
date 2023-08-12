import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { RoleEntity } from './role.entity';

export enum MenuType {
  FOLDER = 'FOLDER',
  ROUTE = 'ROUTE',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

@Entity({ name: 'menus' })
export class MenuEntity extends PublicEntity {
  @Column()
  icon: string;

  @Column()
  path: string;

  @Column({ name: 'parent_id', nullable: true, type: 'int' })
  parentId: number;

  @Column({ type: 'enum', default: MenuType.ROUTE, enum: MenuType })
  type: MenuType;

  @ManyToMany(() => RoleEntity, (role) => role.menu)
  //   @JoinColumn({ name: 'role_id' })
  roles: RoleEntity[];
}
