import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "phone" })
export class Phone {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    model!: string;

    @Column({ default: false })
    isBroken!: boolean;
}