import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ type: 'varchar', length: 64 })
  uid: string;
  @Column({ unique: true })
  name: string;

  @ManyToOne(() => UserEntity, (user) => user.roles)
  user: UserEntity;
}
