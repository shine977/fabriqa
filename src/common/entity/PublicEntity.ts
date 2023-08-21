import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as dayjs from 'dayjs';

export abstract class PublicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
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
