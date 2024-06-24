import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { MoldEntity } from './mold.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
import { FactoryEntity } from 'src/module/factory/entities/factory.entity';

@Entity({ name: 'plastic_parts', orderBy: { created_at: 'DESC' } })
export class PlasticPartsEntity extends PublicEntity {
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
  name: string

  @Column({
    type: 'decimal',
    name: 'mold_cost',
    precision: 20,
    scale: 3,
    nullable: true,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  moldCost: string;
  @Column({
    type: 'varchar',
    length: 500,
  })
  images: string;

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
    comment: '样品克重',
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

  @ManyToOne(() => MaterialEntity, (materail) => materail.plasticPart, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'material_id' })
  material: MaterialEntity;

  @ManyToOne(() => MoldEntity, (mold) => mold.plasticPart, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mold_id' })
  mold: MoldEntity;

  @ManyToOne(() => FactoryEntity, (factory) => factory.plasticPart, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'factory_id' })
  factory: FactoryEntity;
}
