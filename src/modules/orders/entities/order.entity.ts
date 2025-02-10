import { TenantEntity } from 'src/shared/entities/tenant.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DateTransformer, DecimalColumnTransformer } from 'src/common/utils/transformer';

import { BaseEntity } from 'src/core/database/entities/base.entity';
export enum ORDER {
  'sales' = 'sales',
  'purchase' = 'purchase',
}

@Entity({ name: 'orders', orderBy: { createdAt: 'DESC' } })
export class OrderEntity extends BaseEntity {
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
  orderNo: string;

  @Column()
  customer: string;

  @Column({ type: 'timestamp', name: 'purchase_date', transformer: new DateTransformer() })
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

  @Column({ type: 'timestamp', nullable: true, transformer: new DateTransformer() })
  delivery: Date;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.orders)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  children: OrderItemEntity[];
}
