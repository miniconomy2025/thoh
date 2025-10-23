import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from "typeorm";
import { Simulation } from "../simulation/simulation.entity";
import { Person } from "./person.entity";

@Entity({ name: "population" })
export class Population {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  simulationId?: number;

  @ManyToOne(() => Simulation, { nullable: true })
  @JoinColumn({ name: "simulationId" })
  simulation?: Simulation;
} 