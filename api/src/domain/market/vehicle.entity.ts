import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "vehicle_market" })
export class Truck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  vehicle_static_id?: number;

  @Column("decimal", { precision: 12, scale: 2 })
  cost!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  weight!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  operatingCostPerDay!: number;

  @Column({ default: false })
  sold!: boolean;

  @Column({ default: 1 })
  quantity!: number;
} 