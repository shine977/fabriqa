import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { MoldEntity } from './mold.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { FactoryEntity } from 'src/factory/entities/factory.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'components', orderBy: { created_at: 'DESC' } })
export class ComponentEntity extends PublicEntity {
  @Column({
    type: 'decimal',
    name: 'processing_cost',
    precision: 20,
    scale: 3,
    comment: '加工费',
    default: 0,
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  processingCost: number;

  @Column({
    type: 'decimal',
    name: 'mold_cost',
    precision: 20,
    scale: 3,
    comment: '模具费',
    nullable: true,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  moldCost: string;

  @Column({
    type: 'decimal',
    name: 'design_cost',
    precision: 20,
    scale: 3,
    comment: '设计费',
    nullable: true,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  designCost: string;

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
    name: 'sample_weight',
    precision: 10,
    scale: 3,
    comment: '送样克重',
    transformer: new DecimalColumnTransformer(),
  })
  sampleWeight: number;

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

  @ManyToOne(() => MaterialEntity, (materail) => materail.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'material_id' })
  material: MaterialEntity;

  @ManyToOne(() => MoldEntity, (mold) => mold.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mold_id' })
  mold: MoldEntity;

  @ManyToOne(() => FactoryEntity, (factory) => factory.components, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'fac_id' })
  factory: FactoryEntity;
}
