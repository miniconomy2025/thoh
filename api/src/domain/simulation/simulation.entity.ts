import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "simulation" })
export class Simulation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', unique: true, generated: 'increment' })
  simulationId!: number;

  @Column({ default: 'not_started' })
  status!: string;

  @Column({ default: 0 })
  currentDay!: number;

  @Column({ type: 'timestamptz' })
  startDate!: Date;

  @Column({ type: 'bigint', nullable: true })
  unixEpochStartTime!: number;

  // @Column({ type: 'timestamptz' })
  // end!: Date;

  advanceDay() {
    this.currentDay++;
  }

  start() {
    this.status = 'running';
    this.currentDay = 1;
    this.startDate = new Date(this.startDate);
    this.unixEpochStartTime = Date.now();
  }

  end() {
    this.status = 'ended';
  }
  
  getCurrentSimDate() {
    return new Date(this.startDate.getTime() + this.currentDay * 24 * 60 * 60 * 1000);
  }

  getCurrentSimDateString() {
    return this.getCurrentSimDate().toISOString().split('T')[0];
  }

  getUnixEpochStartTime(): number {
    return this.unixEpochStartTime;
  }
  // Add more columns as needed, e.g.:
  // @Column()
  // currentDate!: string;
} 