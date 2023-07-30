import { Column, Entity, ManyToOne } from 'typeorm';
import { Material } from './material.entity';
import { Mould } from './mould.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Customer } from 'src/customers/entities/customer.entity';

@Entity()
export class Part extends PublicEntity {
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
  @ManyToOne(() => Material, (materail) => materail.parts)
  materials: Material[];

  @ManyToOne(() => Mould, (mould) => mould.parts)
  mould: Mould;

  @ManyToOne(() => Customer, (customer) => customer.parts)
  customer: Customer;
}
