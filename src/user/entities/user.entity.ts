import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated, ManyToOne, OneToMany } from 'typeorm';
import { RoleEntity } from './role.entity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';

export enum UserTypeEnum {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  SUPPLIER = 'SUPPLIER',
}

@Entity({ name: 'users' })
export class UserEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ type: 'varchar', length: 64 })
  uid: string;

  @Column({ unique: true, length: 32 })
  username: string;

  @Column({ type: 'char', length: 255 })
  password: string;

  @Column({ unique: true, nullable: true, length: 100 })
  email: string;

  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.EMPLOYEE })
  type: string;

  @Column({ name: 'refresh_Token', nullable: true, length: 800 })
  refreshToken: string;

  @OneToMany(() => RoleEntity, (role) => role.user)
  roles: RoleEntity[];

  @ManyToOne(() => TenantEntity, (tenant) => tenant.users, { createForeignKeyConstraints: false })
  tenant: TenantEntity;
}
