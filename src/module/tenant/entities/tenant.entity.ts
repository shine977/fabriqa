import { Entity, Column, OneToMany } from 'typeorm';

import { PublicEntity } from 'src/common/entity/PublicEntity';
import { OrderEntity } from 'src/module/orders/entities/order.entity';
import { DeliveryEntity } from 'src/module/deliveries/entities/delivery.entity';
import { UserEntity } from 'src/module/user/entities/user.entity';
@Entity({ name: 'tenants', orderBy: { created_at: 'DESC' } })
export class TenantEntity extends PublicEntity {


  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => UserEntity, user => user.tenant)
  users: UserEntity[];

  // @OneToMany(() => Resource, resource => resource.tenant)
  // resources: Resource[];

  @OneToMany(() => OrderEntity, order => order.tenant)
  orders: OrderEntity[]

  @OneToMany(() => DeliveryEntity, delivery => delivery.tenant)
  deliveries: DeliveryEntity[]
}