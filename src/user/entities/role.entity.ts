import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ name: 'role_id', type: 'varchar', length: 64 })
  roleId: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => UserEntity, (user) => user.roles, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
