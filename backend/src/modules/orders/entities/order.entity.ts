import { TenantEntity } from 'src/shared/entities/tenant.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DateTransformer, DecimalColumnTransformer } from '@shared/utils/transformer';

import { BaseEntity } from 'src/core/database/entities/base.entity';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';
import { ORDER_DIRECTION, ORDER_STATUS } from '@shared/constants/order.constants';
import { SupplierEntity } from '@modules/suppliers/entities/supplier.entity';
import { CustomerEntity } from '@modules/customer/entities/customer.entity';

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

  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({ name: 'delivery_address' })
  deliveryAddress: string;

  @ManyToOne(() => SupplierEntity)
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({ type: 'timestamp', name: 'order_date', transformer: new DateTransformer() })
  orderDate: string;

  @Column({ name: 'payment_term' })
  paymentTerm: string; // Payment terms

  @Column({
    type: 'enum',
    enum: ORDER_DIRECTION,
    default: ORDER_DIRECTION.INBOUND,
  })
  direction: ORDER_DIRECTION;

  @Column({
    name: 'task_order_no',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  taskOrderNo: string;

  @Column({ type: 'timestamp', nullable: true, transformer: new DateTransformer() })
  delivery: string;

  @Column({ type: 'jsonb', name: 'dynamic_fields', default: {} })
  dynamicFields: Record<string, any>;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.DRAFT,
  })
  status: ORDER_STATUS;

  @ManyToOne(() => TenantEntity, tenant => tenant.orders)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToOne(() => FactoryEntity, factory => factory.orders)
  @JoinColumn({ name: 'factory_id' })
  factory: FactoryEntity;

  @OneToMany(() => OrderItemEntity, item => item.order, {
    cascade: true,
  })
  items: OrderItemEntity[];
}
