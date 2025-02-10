import { BaseEntity } from 'src/core/database/entities/base.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';

import { MoldEntity } from '@modules/bom/entities/mold.entity';
import { StatementEntity } from '@modules/statement/entities/statement.entity';
import { MaterialEntity } from '@modules/bom/entities/material.entity';
import { ComponentEntity } from '@modules/bom/entities/component.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

export enum CURRENCY {
  RMB = 'RMB',
  USD = 'USD',
}

export enum TAXES {
  VAT = '增值税',
}

export enum FactoryType {
  'CUSTOMER' = 'CUSTOMER',
  'VENDOR' = 'VENDOR',
}

@Entity({ name: 'factories', orderBy: { createdAt: 'DESC' } })
export class FactoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ name: 'delivery_address', type: 'varchar', length: 255, nullable: true, comment: '送货地址' })
  deliveryAddress: string;
  @Column({ name: 'invoice_address', type: 'varchar', length: 255, nullable: true, comment: '发票地址' })
  invoiceAddress: string;
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
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: '税率',
    default: 0.13,
    transformer: new DecimalColumnTransformer(),
  })
  taxRate: number;
  @Column({ type: 'enum', enum: TAXES, comment: '税种', default: TAXES.VAT })
  taxes: TAXES;

  @OneToMany(() => MoldEntity, molds => molds.factory)
  molds: MoldEntity[];

  @OneToMany(() => StatementEntity, state => state.factory)
  statements: StatementEntity[];

  @Column({
    type: 'enum',
    enum: FactoryType,
    default: FactoryType.VENDOR,
  })
  fac_type: FactoryType;

  @OneToMany(() => MaterialEntity, material => material.factory)
  @JoinColumn({ name: 'material_id' })
  materials: MaterialEntity;

  @OneToMany(() => ComponentEntity, component => component.factory)
  @JoinColumn({ name: 'component_id' })
  components: ComponentEntity[];
}
