import { Entity, Column, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { RoleEntity } from '../../role/entities/role.entity';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { TenantEntity } from 'src/shared/entities/tenant.entity';
import { UserPermissionEntity } from './user.permission.entity';

export enum UserTypeEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ROOT = 'ROOT',
  BOSS = 'BOSS',
}

@Entity({ name: 'users', orderBy: { createdAt: 'DESC' } })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserTypeEnum,
    default: UserTypeEnum.USER,
  })
  type: UserTypeEnum;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @ManyToMany(() => RoleEntity, { eager: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @ManyToOne(() => TenantEntity, tenant => tenant.users, {
    createForeignKeyConstraints: false,
  })
  tenant: TenantEntity;

  @OneToMany(() => UserPermissionEntity, permission => permission.user, {
    createForeignKeyConstraints: false,
  })
  permissions: UserPermissionEntity[];
}
