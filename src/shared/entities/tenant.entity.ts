import { Entity, Column, OneToMany } from 'typeorm';
import { UserEntity } from '@modules/user/entities/user.entity';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { DeliveryEntity } from '@modules/deliveries/entities/delivery.entity';

@Entity({ name: 'tenants', orderBy: { createdAt: 'DESC' } })
export class TenantEntity extends BaseEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 100, nullable: true })
  description: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @OneToMany(() => UserEntity, user => user.tenant, {
    createForeignKeyConstraints: false,
  })
  users: UserEntity[];

  @OneToMany(() => OrderEntity, order => order.tenant, {
    createForeignKeyConstraints: false,
  })
  orders: OrderEntity[];

  @OneToMany(() => DeliveryEntity, delivery => delivery.tenant, {
    createForeignKeyConstraints: false,
  })
  deliveries: DeliveryEntity[];
}
