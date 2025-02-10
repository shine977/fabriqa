import { RoleEntity } from '@modules/role/entities/role.entity';
import { BaseEntity } from 'src/core/database/entities/base.entity';

import { TenantEntity } from 'src/shared/entities/tenant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'resource', orderBy: { createdAt: 'DESC' } })
export class ResourceEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToOne(() => TenantEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToMany(() => RoleEntity, role => role.menus, { createForeignKeyConstraints: false })
  @JoinTable()
  roles: RoleEntity[];
}
