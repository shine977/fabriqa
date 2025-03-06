import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';

export enum SupplierType {
  RAW_MATERIAL = 'raw_material', // 原材料供应商
  PARTS = 'parts',              // 零部件供应商
}

@Entity('suppliers')
export class SupplierEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: SupplierType })
  type: SupplierType;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @OneToMany(() => OrderEntity, order => order.supplier)
  orders: OrderEntity[];
}
