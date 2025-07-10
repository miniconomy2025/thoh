import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "orders" })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'itemName', type: 'varchar', length: 100 })
    itemName!: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    quantity!: number;

    @Column({ name: 'unitPrice', type: 'decimal', precision: 12, scale: 2 })
    unitPrice!: number;

    @Column({ name: 'totalPrice', type: 'decimal', precision: 12, scale: 2 })
    totalPrice!: number;

    @Column({ type: 'varchar', length: 10, default: 'D' })
    currency!: string;

    @Column({ name: 'orderDate', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    orderDate!: Date;

    @Column({ type: 'varchar', length: 20, default: 'completed' })
    status!: string;

    @Column({ type: 'int', nullable: true })
    itemId?: number;

    @Column({ type: 'int', nullable: true })
    item_type_id?: number;

    @Column({ type: 'int', nullable: true })
    marketId?: number;
} 