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

    @Column()
    materialRatio!: string;

    @Column()
    productionRate!: number;

    @Column()
    quantity!: number;
}

export class Truck {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number
    ) {}
}
