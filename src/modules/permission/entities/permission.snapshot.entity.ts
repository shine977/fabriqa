import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

// 1. 首先创建一个权限快照实体
@Entity('permission_snapshot')
export class PermissionSnapshotEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    version: string;

    @Column('json')
    permissionData: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ length: 255 })
    description: string;

    @Column({ name: 'is_active', default: false })
    isActive: boolean;

    @Column({ name: 'created_by', length: 50, nullable: true })
    createdBy: string;

    @Column('json', { nullable: true })
    metadata: Record<string, any>;
}