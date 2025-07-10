import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Phone } from './phone.entity';
import { Population } from './population.entity';

@Entity({ name: 'person' })
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  salary: number;

  @ManyToOne(() => Phone, { nullable: true, eager: true })
  @JoinColumn({ name: 'phoneId' })
  phone: Phone | null;

  @Column({ default: true })
  isAlive: boolean;

  constructor(
    salary: number,
    phone: Phone | null = null,
    isAlive: boolean = true
  ) {
    this.salary = salary;
    this.phone = phone;
    this.isAlive = isAlive;
  }

  // ...other methods...
}