// src/core/plugin/entities/plugin.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PluginType, PluginStatus } from '../types/plugin.type';
import { BaseEntity } from '@core/database/entities';

@Entity('plugins')
export class PluginEntity extends BaseEntity {
  @Column({ length: 36, nullable: false })
  pluginId: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50 })
  version: string;

  @Column({ type: 'enum', enum: PluginType })
  type: PluginType;

  @Column({ type: 'enum', enum: PluginStatus, default: PluginStatus.INSTALLED })
  status: PluginStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  author?: string;

  @Column({ type: 'json', nullable: true })
  dependencies?: string[];

  @Column({ type: 'json', nullable: true })
  config?: Record<string, any>;

  @Column({ name: 'entry_point', nullable: true })
  entryPoint?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_enabled_at', nullable: true, precision: 0 })
  lastEnabledAt?: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
