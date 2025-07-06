import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

@Entity({ name: "orders" })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    itemName!: string;

    @Column({ nullable: true })
    itemId!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    quantity!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    unitPrice!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    totalPrice!: number;

    @Column()
    currency!: string;

    @Column("timestamp")
    orderDate!: Date;

    @Column()
    status!: OrderStatus;

    constructor(
        itemName: string,
        quantity: number,
        unitPrice: number,
        totalPrice: number,
        currency: string = 'D',
        status: OrderStatus = 'completed',
        itemId?: number
    ) {
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.currency = currency;
        this.orderDate = new Date(); // Will be overridden by simulation date if provided
        this.status = status;
        this.itemId = itemId || 0;
    }
} 