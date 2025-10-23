import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "machine_static" })
export class MachineStatic {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: "int", nullable: true })
    machine_id?: number;
} 