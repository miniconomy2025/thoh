import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "vehicle_static" })
export class VehicleStatic {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    vehicle_id?: number;
} 