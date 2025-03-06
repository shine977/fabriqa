import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';
import { MaterialEntity } from '@modules/bom/entities/material.entity';
import { InventoryTransactionEntity } from './inventory-transaction.entity';

export enum InventoryStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
}

@Entity('inventory')
export class InventoryEntity extends BaseEntity {
  @ApiProperty({ description: '库存数量' })
  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @ApiProperty({ description: '可用数量' })
  @Column({ name: 'available_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableQuantity: number;

  @ApiProperty({ description: '预留数量' })
  @Column({ name: 'reserved_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  reservedQuantity: number;

  @ApiProperty({ description: '最小库存量' })
  @Column({ name: 'min_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minQuantity: number;

  @ApiProperty({ description: '最大库存量' })
  @Column({ name: 'max_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  maxQuantity: number;

  @ApiProperty({ description: '库存状态' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.AVAILABLE,
  })
  status: InventoryStatus;

  @ApiProperty({ description: '库位' })
  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location: string;

  @ApiProperty({ description: '批次号' })
  @Column({ name: 'batch_number', type: 'varchar', length: 100, nullable: true })
  batchNumber: string;

  @ApiProperty({ description: '生产日期' })
  @Column({ name: 'production_date', type: 'date', nullable: true })
  productionDate: Date;

  @ApiProperty({ description: '过期日期' })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @ApiProperty({ description: '单位成本' })
  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @ApiProperty({ description: '总成本' })
  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  @ApiProperty({ description: '备注' })
  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: '工厂ID' })
  @Column({ name: 'factory_id', nullable: true })
  factoryId: string;

  @ApiProperty({ description: '物料ID' })
  @Column({ name: 'material_id', nullable: true })
  materialId: string;

  @ManyToOne(() => FactoryEntity)
  @JoinColumn({ name: 'factory_id' })
  factory: FactoryEntity;

  @ManyToOne(() => MaterialEntity)
  @JoinColumn({ name: 'material_id' })
  material: MaterialEntity;

  @OneToMany(() => InventoryTransactionEntity, transaction => transaction.inventory)
  transactions: InventoryTransactionEntity[];

  // 动态字段支持
  @Column({ name: 'dynamic_fields', type: 'json', nullable: true })
  dynamicFields: Record<string, any>;
}
