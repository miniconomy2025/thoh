import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "machine_material_ratio" })
export class MachineMaterialRatio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    machine_static_id!: number;

    @Column({ type: 'numeric', nullable: true })
    cases?: number;

    @Column({ type: 'numeric', nullable: true })
    screens?: number;

    @Column({ type: 'numeric', nullable: true })
    electronics?: number;

    @Column({ type: 'numeric', nullable: true })
    copper?: number;

    @Column({ type: 'numeric', nullable: true })
    silicon?: number;

    @Column({ type: 'numeric', nullable: true })
    plastic?: number;

    @Column({ type: 'numeric', nullable: true })
    aluminium?: number;

    @Column({ type: 'numeric', nullable: true })
    sand?: number;
} 