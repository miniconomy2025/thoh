import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "collection" })
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  orderId!: number;

  @Column({ type: "varchar" })
  itemName!: string;

  @Column({ type: "int" })
  itemId!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  amountCollected!: number;

  @Column({ type: "timestamp" })
  orderDate!: Date;

  @Column({ type: "boolean" })
  collected!: boolean;

  @Column({ type: "timestamp", nullable: true })
  collectionDate?: Date;
} 