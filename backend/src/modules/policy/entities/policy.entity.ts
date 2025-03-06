import { BaseEntity } from 'src/core/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'policies', orderBy: { createdAt: 'DESC' } })
export class PolicyEntity extends BaseEntity {
  @Column()
  resourceType: string; // 这条策略适用的资源类型

  @Column()
  department: string; // 允许访问资源的部门

  @Column()
  permission: string; // 允许的操作，例如 'read', 'write', 'delete'
}
