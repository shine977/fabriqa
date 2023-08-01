import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { MouldEntity } from './mould.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Entity({ name: 'parts', orderBy: { created_at: 'DESC' } })
export class PartEntity extends PublicEntity {
  @Column({
    type: 'decimal',
    name: 'processing_fee',
    precision: 2,
    width: 15,
    comment: '加工费',
    default: 0,
    nullable: true,
  })
  processingFee: string;

  @Column({
    type: 'decimal',
    name: 'mold_fee',
    precision: 2,
    width: 15,
    comment: '模具费',
    nullable: true,
    default: 0,
  })
  moldFee: string;

  @Column({
    type: 'decimal',
    name: 'design_fee',
    precision: 2,
    width: 15,
    comment: '设计费',
    nullable: true,
    default: 0,
  })
  designFee: string;

  @Column({
    type: 'decimal',
    precision: 2,
    width: 8,
    comment: '克重',
  })
  gram_weight: number;

  @ManyToOne(() => MaterialEntity, (materail) => materail.parts)
  @JoinColumn()
  material: MaterialEntity;

  @ManyToOne(() => MouldEntity, (mould) => mould.parts)
  @JoinColumn()
  mould: MouldEntity;

  @ManyToOne(() => CustomerEntity, (customer) => customer.parts)
  @JoinColumn()
  customer: CustomerEntity;
}
