import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Market } from "./market.entity";

@Entity({ name: "machine" })
export class Machine {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: string;

    @Column("decimal", { precision: 12, scale: 2 })
    cost!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    weight!: number;

    @Column("decimal", { precision: 5, scale: 2 })
    productionRatio!: number;

    @Column()
    marketId!: number;

    @ManyToOne(() => Market, (market: Market) => market.machines)
    market!: Market;

    @Column({ default: false })
    sold!: boolean;
}

export class Vehicle {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number
    ) {}
}
