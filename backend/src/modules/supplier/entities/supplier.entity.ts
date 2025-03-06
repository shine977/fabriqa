import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { SupplierContactEntity } from './supplier-contact.entity';
import { TenantEntity } from '@shared/entities/tenant.entity';

/**
 * Entity representing a supplier in the system
 */
@Entity('suppliers')
export class SupplierEntity {
  @ApiProperty({ description: '供应商ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '供应商编码' })
  @Column({ length: 50, unique: true })
  @Index()
  code: string;

  @ApiProperty({ description: '供应商名称' })
  @Column({ length: 100 })
  @Index()
  name: string;

  @ApiProperty({ description: '供应商类型' })
  @Column({ length: 50, nullable: true })
  type: string;

  @ApiProperty({ description: '供应商等级 (A/B/C/D)' })
  @Column({ length: 1, nullable: true, default: 'C' })
  rating: string;

  @ApiProperty({ description: '税号' })
  @Column({ length: 50, nullable: true })
  taxId: string;

  @ApiProperty({ description: '电话' })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: '电子邮箱' })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiProperty({ description: '网站' })
  @Column({ length: 255, nullable: true })
  website: string;

  @ApiProperty({ description: '国家' })
  @Column({ length: 50, nullable: true })
  country: string;

  @ApiProperty({ description: '省/州' })
  @Column({ length: 50, nullable: true })
  province: string;

  @ApiProperty({ description: '城市' })
  @Column({ length: 50, nullable: true })
  city: string;

  @ApiProperty({ description: '详细地址' })
  @Column({ length: 255, nullable: true })
  address: string;

  @ApiProperty({ description: '邮政编码' })
  @Column({ length: 20, nullable: true })
  postalCode: string;

  @ApiProperty({ description: '付款条件' })
  @Column({ length: 100, nullable: true })
  paymentTerms: string;

  @ApiProperty({ description: '付款方式' })
  @Column({ length: 50, nullable: true })
  paymentMethod: string;

  @ApiProperty({ description: '货币' })
  @Column({ length: 3, nullable: true, default: 'CNY' })
  currency: string;

  @ApiProperty({ description: '银行名称' })
  @Column({ length: 100, nullable: true })
  bankName: string;

  @ApiProperty({ description: '银行账号' })
  @Column({ length: 50, nullable: true })
  bankAccount: string;

  @ApiProperty({ description: '银行账户持有人' })
  @Column({ length: 100, nullable: true })
  bankAccountHolder: string;

  @ApiProperty({ description: '是否活跃' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({ description: '额外信息 (JSON)' })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '创建人ID' })
  @Column({ nullable: true })
  createdBy: string;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '更新人ID' })
  @Column({ nullable: true })
  updatedBy: string;

  @ApiProperty({ description: '删除时间' })
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({ description: '删除人ID' })
  @Column({ nullable: true })
  deletedBy: string;

  @ApiProperty({ description: '租户ID' })
  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @OneToMany(() => SupplierContactEntity, contact => contact.supplier)
  contacts: SupplierContactEntity[];
}
