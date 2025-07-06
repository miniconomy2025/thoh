import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "vehicle" })
export class Truck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  cost!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  weight!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  operatingCostPerDay!: number;

  @Column({ default: false })
  sold!: boolean;
} 