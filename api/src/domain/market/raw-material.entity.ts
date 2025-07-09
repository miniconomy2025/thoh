import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { RawMaterialType } from "./market.types";

@Entity({ name: "raw_materials_market" })
export class RawMaterial {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    material_static_id?: number;

    @Column("decimal", { precision: 12, scale: 2 })
    costPerKg!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    availableWeight!: number;

    constructor(material_static_id: number, costPerKg: number, availableWeight: number) {
        this.material_static_id = material_static_id;
        this.costPerKg = costPerKg;
        this.availableWeight = availableWeight;
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
        this.availableWeight = newWeight;
    }
}