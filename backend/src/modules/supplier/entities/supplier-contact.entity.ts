import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SupplierEntity } from './supplier.entity';

/**
 * Entity representing a supplier contact person
 */
@Entity('supplier_contacts')
export class SupplierContactEntity {
  @ApiProperty({ description: '联系人ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '供应商ID' })
  @Column()
  @Index()
  supplierId: string;

  @ApiProperty({ description: '联系人姓名' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '职位' })
  @Column({ length: 100, nullable: true })
  position: string;

  @ApiProperty({ description: '部门' })
  @Column({ length: 100, nullable: true })
  department: string;

  @ApiProperty({ description: '电话' })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: '手机' })
  @Column({ length: 20, nullable: true })
  mobile: string;

  @ApiProperty({ description: '电子邮箱' })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiProperty({ description: '是否主要联系人' })
  @Column({ default: false })
  isPrimary: boolean;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remarks: string;

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

  @ManyToOne(() => SupplierEntity, supplier => supplier.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: SupplierEntity;
}
