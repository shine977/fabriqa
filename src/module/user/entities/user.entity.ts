import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantEntity } from 'src/module/tenant/entities/tenant.entity';
import { UserRoleEntity } from './userRole.entity';
export enum UserTypeEnum {
  ROOT = 'ROOT',
  NORMAL = 'NORMAL',
}

@Entity({ name: 'users' })
export class UserEntity extends PublicEntity {
  @Column({ type: 'uuid', length: 64, generated: 'uuid' })
  uid: string;

  @Column({ unique: true, length: 32 })
  username: string;

  @Column({ type: 'char', length: 255 })
  password: string;

  @Column({ unique: true, nullable: true, length: 100 })
  email: string;

  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.NORMAL })
  type: string;

  @Column({ name: 'refresh_Token', nullable: true, length: 800 })
  refreshToken: string;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.users, { createForeignKeyConstraints: false })
  tenant: TenantEntity;

  @OneToMany(() => UserRoleEntity, userRole => userRole.user)
  roles: UserRoleEntity[];
}
