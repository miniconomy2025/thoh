import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "material_static" })
export class MaterialStatic {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;
} 