import { Entity, PrimaryGeneratedColumn, OneToMany, Column, ManyToOne, JoinColumn } from "typeorm";
import { Machine } from "./machine.entity";
import { Vehicle } from "./vehicle.entity";
import { RawMaterial } from "./raw-material.entity";
import { Simulation } from "../simulation/simulation.entity";

@Entity({ name: "market" })
export class Market {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  simulationId?: number;

  @ManyToOne(() => Simulation, { nullable: true })
  @JoinColumn({ name: "simulationId" })
  simulation?: Simulation;

  @OneToMany(() => Machine, machine => machine.market)
  machines!: Machine[];

  @OneToMany(() => Vehicle, vehicle => vehicle.market)
  vehicles!: Vehicle[];

  @OneToMany(() => RawMaterial, rawMaterial => rawMaterial.market)
  rawMaterials!: RawMaterial[];
} 