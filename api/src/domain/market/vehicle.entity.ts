import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Market } from "./market.entity";

@Entity({ name: "vehicle" })
export class Vehicle {
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

  @Column()
  marketId!: number;

  @ManyToOne(() => Market, (market: Market) => market.vehicles)
  market!: Market;

  @Column({ default: false })
  sold!: boolean;
} 