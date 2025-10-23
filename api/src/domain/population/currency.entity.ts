import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "currency" })
export class Currency {
    @PrimaryColumn({ type: "varchar" })
    code!: string;

    @Column({ type: "text", nullable: true })
    description?: string;
} 