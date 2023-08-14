import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { MoldEntity } from './mold.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Entity({ name: 'components', orderBy: { created_at: 'DESC' } })
export class ComponentEntity extends PublicEntity {
  @Column({
    type: 'decimal',
    name: 'processing_cost',
    precision: 2,
    width: 15,
    comment: '加工费',
    default: 0,
    nullable: true,
  })
  processingCost: number;

  @Column({
    type: 'decimal',
    name: 'mold_cost',
    precision: 2,
    width: 15,
    comment: '模具费',
    nullable: true,
    default: 0,
  })
  moldCost: string;

  @Column({
    type: 'decimal',
    name: 'design_cost',
    precision: 2,
    width: 15,
    comment: '设计费',
    nullable: true,
    default: 0,
  })
  designCost: string;

  @Column({
    type: 'decimal',
    name: 'gram_weight',
    precision: 2,
    width: 8,
    comment: '克重',
  })
  gramWeight: number;

  @Column({
    type: 'decimal',
    name: 'sample_weight',
    precision: 2,
    width: 8,
    comment: '送样克重',
  })
  sampleWeight: number;

  @Column({
    type: 'decimal',
    name: 'gate_weight',
    nullable: true,
    precision: 2,
    width: 8,
    comment: '浇口克重',
  })
  gateWeight: number;

  @ManyToOne(() => MaterialEntity, (materail) => materail.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'material_id' })
  material: MaterialEntity;

  @ManyToOne(() => MoldEntity, (mold) => mold.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mold_id' })
  mold: MoldEntity;

  @ManyToOne(() => CustomerEntity, (customer) => customer.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
