import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { DateTransformer, DecimalColumnTransformer } from '@shared/utils/transformer';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { MATERIAL_TYPE } from '@shared/constants/order.constants';

@Entity({ name: 'order_items', orderBy: { createdAt: 'DESC' } })
export class OrderItemEntity extends BaseEntity {
  @Column({ name: 'order_no', nullable: true })
  orderNo: string;

  @Column()
  name: string;
  @Column({ name: 'material_no' })
  materialNo: string;

  @Column({ name: 'material_code', nullable: true })
  materialCode: string;

  @Column({
    type: 'enum',
    enum: MATERIAL_TYPE,
  })
  material: MATERIAL_TYPE; // Material type

  @Column({ nullable: true })
  specification: string;
  @Column({
    name: 'task_order_no',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  taskOrderNo: string;

  @Column({ type: 'varchar', length: 255, comment: '单位', default: 'pcs' })
  unit: string;

  @Column({ type: 'timestamp', nullable: true, transformer: new DateTransformer() })
  delivery: Date;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true, transformer: new DecimalColumnTransformer() })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 3,
    comment: '单价',
    transformer: new DecimalColumnTransformer(),
  })
  unitPrice: number;

  @Column({ type: 'jsonb', name: 'dynamic_fields', default: {} })
  dynamicFields: Record<string, any>;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @ManyToOne(() => OrderEntity, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  totalAmount: number;
}
