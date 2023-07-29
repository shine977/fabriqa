import { Column, Entity, ManyToOne } from 'typeorm';
import { Material } from './material.entity';
import { Mould } from './mould.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Customer } from 'src/customers/entities/customer.entity';

@Entity()
export class Part extends PublicEntity {
  @Column({
    type: 'decimal',
    precision: 2,
    width: 15,
    comment: '加工费',
    default: 0,
    nullable: true,
  })
  processing_fee: string;
  @Column({
    type: 'decimal',
    precision: 2,
    width: 15,
    comment: '模具费',
    nullable: true,
    default: 0,
  })
  mold_fee: string;
  @Column({
    type: 'decimal',
    precision: 2,
    width: 15,
    comment: '设计费',
    nullable: true,
    default: 0,
  })
  design_fee: string;
  @ManyToOne(() => Material, (materail) => materail.parts)
  materials: Material[];

  @ManyToOne(() => Mould, (mould) => mould.parts)
  mould: Mould;

  @ManyToOne(() => Customer, (customer) => customer.parts)
  customer: Customer;
}
