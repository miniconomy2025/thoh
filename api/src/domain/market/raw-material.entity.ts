import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
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

    constructor(name: RawMaterialType, costPerKg: number, availableWeight: number) {
        this.name = name;
        this.costPerKg = costPerKg;
        this.availableWeight = availableWeight;
    }

    get rawMaterialName(): string {
        return this.name;
    }

    get pricePerKg(): number {
        return this.costPerKg;
    }

    get quantityAvailable(): number {
        return Math.floor(this.availableWeight);
    }

    public updatePrice(newCost: number): void {
        if (newCost < 0) {
            throw new Error("Cost cannot be negative.");
        }
        this.costPerKg = newCost;
    }

    public adjustAvailability(changeInWeight: number): void {
        const newWeight = Number(changeInWeight);

        console.log(`[RAW MATERIAL] Adjusting availability of ${this.name} by ${changeInWeight} kg. New weight: ${newWeight} kg`);
        this.availableWeight = newWeight;
    }
}