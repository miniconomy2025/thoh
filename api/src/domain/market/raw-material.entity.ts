import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Market } from "./market.entity";
import { RawMaterialType } from "./market.types";

@Entity({ name: "raw_material" })
export class RawMaterial {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column("decimal", { precision: 12, scale: 2 })
    costPerKg!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    availableWeight!: number;

    @Column()
    marketId!: number;

    @ManyToOne(() => Market, (market: Market) => market.rawMaterials)
    market!: Market;

    constructor(name: RawMaterialType, costPerKg: number, availableWeight: number, marketId: number) {
        this.name = name;
        this.costPerKg = costPerKg;
        this.availableWeight = availableWeight;
        this.marketId = marketId;
    }

    // Business logic: Update the price of the material.
    public updatePrice(newCost: number): void {
        if (newCost < 0) {
            throw new Error("Cost cannot be negative.");
        }
        this.costPerKg = newCost;
    }

    // Business logic: Adjust the available quantity.
    public adjustAvailability(changeInWeight: number): void {
        const newWeight = Number(this.availableWeight) + Number(changeInWeight);
        if (newWeight < 0) {
            throw new Error("Available weight cannot be negative.");
        }
        console.log(`[RAW MATERIAL] Adjusting availability of ${this.name} by ${changeInWeight} kg. New weight: ${newWeight} kg`);
        this.availableWeight = newWeight;
    }
}