import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhoneStatic } from "./phone-static.entity";

@Entity({ name: "phone" })
export class Phone {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => PhoneStatic, { eager: true })
    @JoinColumn({ name: "modelId" })
    model!: PhoneStatic;

    @Column({ default: false })
    isBroken!: boolean;
}