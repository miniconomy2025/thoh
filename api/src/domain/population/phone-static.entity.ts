import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "phone_static" })
export class PhoneStatic {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;
} 