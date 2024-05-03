import { ComponentEntity } from 'src/bom/entities/component.entity';
import { MoldEntity } from 'src/bom/entities/mold.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
import { StatementEntity } from 'src/statement/entities/statement.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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

@Entity({ name: 'factories', orderBy: { created_at: 'DESC' } })
export class FactoryEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'delivery_address', type: 'char', length: 255, nullable: true, comment: '送货地址' })
  deliveryAddress: string;
  @Column({ name: 'invoice_address', type: 'char', length: 255, nullable: true, comment: '发票地址' })
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

  @OneToMany(() => ComponentEntity, (component) => component.factory)
  components: ComponentEntity[];

  @OneToMany(() => MoldEntity, (molds) => molds.factory)
  molds: MoldEntity[];

  @OneToMany(() => StatementEntity, (state) => state.factory)
  statements: StatementEntity[];
  @Column({
    type: 'enum',
    enum: FactoryType,
    comment: '货币',
    default: FactoryType.VENDOR,
  })
  fac_type: FactoryType;

  @Column()
  tenantId: string;
}
