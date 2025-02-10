import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { MoldEntity } from './mold.entity';

import { DecimalColumnTransformer } from 'src/common/utils/transformer';

import { BaseEntity } from 'src/core/database/entities/base.entity';
import { FactoryEntity } from '@modules/factory/entities/factory.entity';

@Entity({ name: 'components', orderBy: { createdAt: 'DESC' } })
export class ComponentEntity extends BaseEntity {
  @Column({
    type: 'decimal',
    name: 'processing_cost',
    precision: 20,
    scale: 3,
    default: 0,
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  processingCost: number;

  @Column()
  name: string;

  @Column({
    type: 'decimal',
    name: 'mold_cost',
    precision: 20,
    scale: 3,
    nullable: true,

    transformer: new DecimalColumnTransformer(),
  })
  moldCost: number;
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  images: string;

  @Column({
    type: 'decimal',
    name: 'design_cost',
    precision: 20,
    scale: 3,
    comment: '设计费',
    nullable: true,

    transformer: new DecimalColumnTransformer(),
  })
  designCost: number;

  @Column({
    type: 'decimal',
    name: 'gram_weight',
    precision: 10,
    scale: 3,
    comment: '克重',
    transformer: new DecimalColumnTransformer(),
  })
  gramWeight: number;

  @Column({
    type: 'decimal',
    name: 'gate_weight',
    nullable: true,
    precision: 10,
    scale: 3,
    comment: '浇口克重',
    transformer: new DecimalColumnTransformer(),
  })
  gateWeight: number;

  @ManyToOne(() => MaterialEntity, materail => materail.component, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'material_id' })
  material: MaterialEntity;

  @ManyToOne(() => MoldEntity, mold => mold.component, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mold_id' })
  mold: MoldEntity;

  @ManyToOne(() => FactoryEntity, factory => factory.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'factory_id' })
  factory: FactoryEntity[];
}
