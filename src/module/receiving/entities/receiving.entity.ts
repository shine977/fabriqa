import { PublicEntity } from "src/common/entity/PublicEntity";
import { DecimalColumnTransformer } from "src/common/utils/transformer";
import { FactoryEntity } from "src/module/factory/entities/factory.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity({ name: 'receiving_report', orderBy: { created_at: 'DESC' } })
export class ReceivingEntity extends PublicEntity {

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ name: 'material_code', type: 'varchar', length: 255, nullable: true })
    materialCode: string

    @Column({ name: 'part_no', type: 'varchar', length: 255, nullable: true })
    partNo: string

    @Column({ name: 'order_no', type: 'varchar', length: 255, nullable: true })
    orderNo: string

    @Column({ name: 'task_order_no', type: 'varchar', length: 255, nullable: true })
    taskOrderNo: string

    @Column({ name: 'delivery_date', type: 'varchar', length: 255, nullable: true })
    deliveryDate: Date;

    @Column({ type: 'decimal', precision: 20, scale: 2, transformer: new DecimalColumnTransformer() })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 3, transformer: new DecimalColumnTransformer() })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 20, scale: 3, transformer: new DecimalColumnTransformer(), nullable: true })
    amount: number;

    @ManyToOne(() => FactoryEntity, (factory) => factory.statements, { createForeignKeyConstraints: false })
    factory: FactoryEntity;
}
