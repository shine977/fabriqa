import { BaseEntity } from 'src/core/database/entities/base.entity';
import { PermissionScope } from '@shared/enum/permission.enum';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('user_permissions')
export class UserPermissionEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => PermissionEntity)
  permission: PermissionEntity;

  @Column({
    type: 'enum',
    enum: PermissionScope,
  })
  scope: PermissionScope;
}
