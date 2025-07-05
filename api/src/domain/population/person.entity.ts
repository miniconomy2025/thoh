import { Phone } from './phone.entity';
import { Column } from 'typeorm';

export class Person {
  id: number;
  bankAccountId: string;
  @Column('decimal', { precision: 12, scale: 2 })
  salary: number;
  phone: Phone | null;
  phoneWorking: boolean;

    constructor(
    id: number,
    bankAccountId: string,
    salary: number,
    phone: Phone | null = null,
    phoneWorking: boolean = true
  ) {
    this.id = id;
    this.bankAccountId = bankAccountId;
    this.salary = salary;
        this.phone = phone;
    this.phoneWorking = phoneWorking;
        }

  // ...other methods...
}