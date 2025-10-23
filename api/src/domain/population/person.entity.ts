import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Phone } from './phone.entity';
import { Population } from './population.entity';

@Entity({ name: 'person' })
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { name: 'salary', precision: 12, scale: 2 })
  private _salary: number;

  @ManyToOne(() => Phone, { nullable: true, eager: true })
  @JoinColumn({ name: 'phoneId' })
  phone: Phone | null;

  @Column({ type: "boolean", default: true })
  isAlive: boolean;

  @Column({ name: 'accountNumber', nullable: true, unique: true, type: 'varchar' })
  accountNumber: string | null;

  constructor(
    salary: number,
    phone: Phone | null = null,
    isAlive: boolean = true,
    accountNumber: string | null = null
  ) {
    this._salary = salary;
    this.phone = phone;
    this.isAlive = isAlive;
    this.accountNumber = accountNumber;
  }

  get salary(): number {
    return this._salary;
  }

  set salary(value: number) {
    this._salary = value;
  }
}