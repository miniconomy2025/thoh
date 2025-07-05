import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Simulation } from "../simulation/simulation.entity";

@Entity({ name: "population" })
export class Population {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  simulationId?: number;

  @ManyToOne(() => Simulation, { nullable: true })
  @JoinColumn({ name: "simulationId" })
  simulation?: Simulation;
} 