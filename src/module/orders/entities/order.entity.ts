import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/module/tenant/entities/tenant.entity';

import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
export enum ORDER {
  'sales' = 'sales',
  'purchase' = 'purchase',
}

@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class OrderEntity extends PublicEntity {
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 3,
    comment: '金额',
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  amount: number;

  @Column()
  orderNo: string


  @Column({ type: 'datetime', name: 'purchase_date', comment: '采购日期' })
  purchaseDate: Date;

  @Column({
    type: 'varchar',
    name: 'payment_clause',
    length: 255,
    comment: '付款条件',
  })
  paymentClause: string;

  @Column({
    name: 'task_order_no',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  taskOrderNo: string;

  @Column({ type: 'datetime', nullable: true })
  delivery: Date;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.orders)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  items: OrderItemEntity[];
}
