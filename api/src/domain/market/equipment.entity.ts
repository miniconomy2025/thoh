import { Money, Weight } from "../shared/value-objects";
import { MachineType, VehicleType } from "./market.types";

export abstract class Equipment {
    public readonly id?: number; // Make id optional
    public readonly type: MachineType | VehicleType;
    public cost: Money;
    public weight: Weight;

    constructor(type: MachineType | VehicleType, cost: Money, weight: Weight, id?: number) { // id is now optional
        this.id = id;
        this.type = type;
        this.cost = cost;
        this.weight = weight;
    }
}

export class Machine extends Equipment {
    public readonly productionRatio: number;
    marketId: number;
    sold: boolean;

    constructor(type: MachineType, cost: Money, weight: Weight, ratio: number, marketId: number, id: number, sold: boolean = false) {
        super(type, cost, weight, id);
        this.productionRatio = ratio;
        this.marketId = marketId;
        this.sold = sold;
    }
}

export class Vehicle extends Equipment {
    public readonly operatingCostPerDay: Money;
    marketId: number;
    sold: boolean;

    constructor(type: VehicleType, cost: Money, weight: Weight, operatingCost: Money, marketId: number, id: number, sold: boolean = false) {
        super(type, cost, weight, id);
        this.operatingCostPerDay = operatingCost;
        this.marketId = marketId;
        this.sold = sold;
    }
}
