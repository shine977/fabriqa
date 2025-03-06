import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryEntity } from './inventory.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { OrderItemEntity } from '@modules/orders/entities/order-item.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  SALES = 'sales',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  PRODUCTION = 'production',
  CONSUMPTION = 'consumption',
  SCRAP = 'scrap',
}

@Entity('inventory_transaction')
export class InventoryTransactionEntity extends BaseEntity {
  @ApiProperty({ description: '交易类型' })
  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @ApiProperty({ description: '交易数量' })
  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @ApiProperty({ description: '交易前数量' })
  @Column({ name: 'before_quantity', type: 'decimal', precision: 10, scale: 2 })
  beforeQuantity: number;

  @ApiProperty({ description: '交易后数量' })
  @Column({ name: 'after_quantity', type: 'decimal', precision: 10, scale: 2 })
  afterQuantity: number;

  @ApiProperty({ description: '单位成本' })
  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @ApiProperty({ description: '总成本' })
  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  @ApiProperty({ description: '参考单号' })
  @Column({ name: 'reference_no', type: 'varchar', length: 100, nullable: true })
  referenceNo: string;

  @ApiProperty({ description: '参考类型' })
  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string;

  @ApiProperty({ description: '备注' })
  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: '库存ID' })
  @Column({ name: 'inventory_id' })
  inventoryId: string;

  @ApiProperty({ description: '操作人ID' })
  @Column({ name: 'operator_id', nullable: true })
  operatorId: string;

  @ApiProperty({ description: '订单ID' })
  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @ApiProperty({ description: '订单项ID' })
  @Column({ name: 'order_item_id', nullable: true })
  orderItemId: string;

  @ApiProperty({ description: '源库位' })
  @Column({ name: 'source_location', type: 'varchar', length: 100, nullable: true })
  sourceLocation: string;

  @ApiProperty({ description: '目标库位' })
  @Column({ name: 'target_location', type: 'varchar', length: 100, nullable: true })
  targetLocation: string;

  @ManyToOne(() => InventoryEntity, inventory => inventory.transactions)
  @JoinColumn({ name: 'inventory_id' })
  inventory: InventoryEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'operator_id' })
  operator: UserEntity;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => OrderItemEntity)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItemEntity;

  // 动态字段支持
  @Column({ name: 'dynamic_fields', type: 'json', nullable: true })
  dynamicFields: Record<string, any>;
}
