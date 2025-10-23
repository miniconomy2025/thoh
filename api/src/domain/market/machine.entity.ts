import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "machine_market" })
export class Machine {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    machine_static_id?: number;

    @Column("decimal", { precision: 12, scale: 2 })
    cost!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    weight!: number;

    @Column({ type: "varchar" })
    materialRatio!: string;

    @Column({ type: "int" })
    productionRate!: number;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "boolean", default: false })
    sold!: boolean;
}

export class Truck {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number
    ) {}
}
