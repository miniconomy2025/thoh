import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "machine_static" })
export class MachineStatic {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    machine_id?: number;
} 