import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/database/entities/base.entity';

@Entity('operation_logs')
export class OperationLogEntity extends BaseEntity {
  @Column({ length: 50, comment: '操作模块' })
  module: string;

  @Column({ length: 100, comment: '操作类型' })
  type: string;

  @Column({ length: 500, comment: '操作描述' })
  description: string;

  @Column({ length: 100, comment: '请求方法' })
  method: string;

  @Column({ length: 255, comment: '请求URL' })
  url: string;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  params?: string;

  @Column({ type: 'text', nullable: true, comment: '请求结果' })
  result?: string;

  @Column({ length: 50, comment: '操作人IP' })
  ip: string;

  @Column({ length: 100, comment: '操作人' })
  operator: string;

  @Column({ type: 'int', comment: '耗时(ms)' })
  duration: number;
}
