import { MouldEntity } from 'src/bom/entities/mould.entity';
import { PartEntity } from 'src/bom/entities/part.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum CURRENCY {
  RMB = 'RMB',
  USD = 'USD',
}

export enum TAXES {
  VAT = '增值税',
}

@Entity({ name: 'customers', orderBy: { created_at: 'DESC' } })
export class CustomerEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'int', width: 50, nullable: true })
  groud_id: number;
  @Column({ type: 'char', length: 255, comment: '送货地址' })
  delivery_address: string;
  @Column({ type: 'char', length: 255, comment: '发票地址' })
  invoice_address: string;
  @Column({ type: 'varchar', length: 60, comment: '联系人', nullable: true })
  contact: string;
  @Column({ type: 'varchar', length: 60, comment: '联系电话', nullable: true })
  mobile: string;
  @Column({
    type: 'enum',
    enum: CURRENCY,
    comment: '货币',
    default: CURRENCY.RMB,
  })
  currency: CURRENCY;
  @Column({
    type: 'decimal',
    width: 50,
    precision: 2,
    comment: '税率',
    default: 0.13,
  })
  tax_rate: number;
  @Column({ type: 'enum', enum: TAXES, comment: '税种', default: TAXES.VAT })
  taxes: TAXES;

  @OneToMany(() => PartEntity, (part) => part.customer)
  parts: PartEntity[];

  @OneToMany(() => MouldEntity, (mould) => mould.customer)
  moulds: MouldEntity[];
}
