import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "collection" })
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column()
  itemName!: string;

  @Column()
  itemId!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  amountCollected!: number;

  @Column()
  orderDate!: Date;

  @Column()
  collected!: boolean;

  @Column({ nullable: true })
  collectionDate?: Date;
} 