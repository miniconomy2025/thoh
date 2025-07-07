import { Money, Weight } from "../shared/value-objects";
import { MachineType, TruckType } from "./market.types";

export abstract class Equipment {
    public readonly id?: number; // Make id optional
    public readonly type: MachineType | TruckType;
    public cost: Money;
    public weight: Weight;

    constructor(type: MachineType | TruckType, cost: Money, weight: Weight, id?: number) { // id is now optional
        this.id = id;
        this.type = type;
        this.cost = cost;
        this.weight = weight;
    }
}

export class Machine extends Equipment {
    public readonly materialRatio: string;
    public readonly productionRate: number;
    public readonly quantity: number;
    public materialRatioDescription?: string;
    sold: boolean;

    constructor(
        type: MachineType,
        cost: Money,
        weight: Weight,
        materialRatio: string,
        productionRate: number,
        quantity: number,
        id: number,
        sold: boolean = false,
        materialRatioDescription?: string
    ) {
        super(type, cost, weight, id);
        this.materialRatio = materialRatio;
        this.productionRate = productionRate;
        this.quantity = quantity;
        this.sold = sold;
        this.materialRatioDescription = materialRatioDescription;
    }

    get machineName(): string {
        return this.type;
    }
}

export class Truck extends Equipment {
    public readonly operatingCostPerDay: Money;
    public readonly quantity: number;
    sold: boolean;

    constructor(type: TruckType, cost: Money, weight: Weight, operatingCost: Money, quantity: number, id: number, sold: boolean = false) {
        super(type, cost, weight, id);
        this.operatingCostPerDay = operatingCost;
        this.quantity = quantity;
        this.sold = sold;
    }

    get truckName(): string {
        return this.type;
    }

    get maximumLoad(): number {
        return this.weight.value;
    }
}
