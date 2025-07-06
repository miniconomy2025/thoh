import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "currency" })
export class Currency {
    @PrimaryColumn()
    code!: string;

    @Column({ nullable: true })
    description?: string;
} 