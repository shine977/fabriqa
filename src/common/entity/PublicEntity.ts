import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as dayjs from 'dayjs';
export abstract class PublicEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Generated('uuid')
  @Column({ name: 'tenant_Id' })
  tenantId: string;

  @CreateDateColumn({
    name: 'created_at',
    transformer: {
      to: (date) => date,
      from: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    transformer: {
      to: (date) => date,
      from: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  })
  updatedAt: Date;
  @DeleteDateColumn({
    name: 'deleted_at',
    transformer: {
      to: (date) => date,
      from: (date) => date && dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  })
  deletedAt: Date;
}
