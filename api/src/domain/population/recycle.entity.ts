import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { Phone } from "./phone.entity";

@Entity({ name: "recycle" })
export class Recycle {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Phone, { eager: true })
    @JoinColumn({ name: "phoneId" })
    phone!: Phone;

    @CreateDateColumn()
    brokenAt!: Date;
} 