import { Money, Weight } from "../shared/value-objects";

export abstract class Equipment {
    public readonly id?: number; // Make id optional
    public readonly staticId: number; // Use static table ID
    public cost: Money;
    public weight: Weight;

    constructor(staticId: number, cost: Money, weight: Weight, id?: number) {
        this.id = id;
        this.staticId = staticId;
        this.cost = cost;
        this.weight = weight;
    }
}

export class Machine extends Equipment {
    public readonly materialRatio: Record<string, number>;
    public readonly productionRate: number;
    public readonly quantity: number;
    sold: boolean;

    constructor(
        machineStaticId: number,
        cost: Money,
        weight: Weight,
        materialRatio: Record<string, number>,
        productionRate: number,
        quantity: number,
        id: number,
        sold: boolean = false
    ) {
        super(machineStaticId, cost, weight, id);
        this.materialRatio = materialRatio;
        this.productionRate = productionRate;
        this.quantity = quantity;
        this.sold = sold;
    }

    get machineStaticId(): number {
        return this.staticId;
    }
}

export class Truck extends Equipment {
    public readonly operatingCostPerDay: Money;
    public readonly quantity: number;
    sold: boolean;

    constructor(vehicleStaticId: number, cost: Money, weight: Weight, operatingCost: Money, quantity: number, id: number, sold: boolean = false) {
        super(vehicleStaticId, cost, weight, id);
        this.operatingCostPerDay = operatingCost;
        this.quantity = quantity;
        this.sold = sold;
    }

    get vehicleStaticId(): number {
        return this.staticId;
    }

    get maximumLoad(): number {
        return this.weight.value;
    }
}
