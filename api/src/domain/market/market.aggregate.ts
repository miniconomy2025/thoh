import { Machine, Truck } from "./equipment.entity";
import { RawMaterialType } from "./market.types";
import { RawMaterial } from "./raw-material.entity";
import { getMarketConfig } from '../shared/config';
import { PgCurrencyRepository } from "../../infrastructure/persistence/postgres/currency.repository";
export class RawMaterialsMarket {
    private rawMaterials: RawMaterial[];
    private currencyRepo: PgCurrencyRepository;

    constructor(initialMaterials: RawMaterial[]) {
        this.rawMaterials = initialMaterials;
        this.currencyRepo = new PgCurrencyRepository();
    }

    public async checkRawMaterialAvailability(materialStaticId: number, weightToSell: number): Promise<{ amount: number, currency: string, materialId: number }> {
        const material = this.rawMaterials.find(m => m.material_static_id === materialStaticId);
        if (!material) {
            throw new Error(`Raw material with static ID '${materialStaticId}' not found in the market.`);
        }
        
        const totalAvailableWeight = this.rawMaterials
            .filter(m => m.material_static_id === materialStaticId)
            .reduce((sum, m) => sum + m.availableWeight, 0);
            
        if (totalAvailableWeight < weightToSell) {
            throw new Error(`Not enough of material static ID '${materialStaticId}' in stock.`);
        }
        const totalCost = Number(material.costPerKg) * weightToSell;
        const currency = await this.currencyRepo.getDefaultCurrency();
        return { amount: totalCost, currency: currency?.code || 'D', materialId: material.id };
    }

    public async sellRawMaterial(materialStaticId: number, weightToSell: number): Promise<{ amount: number, currency: string, materialId: number }> {
        const material = this.rawMaterials.find(m => m.material_static_id === materialStaticId);
        if (!material) {
            throw new Error(`Raw material with static ID '${materialStaticId}' not found in the market.`);
        }
        const totalAvailableWeight = this.rawMaterials
            .filter(m => m.material_static_id === materialStaticId)
            .reduce((sum, m) => sum + m.availableWeight, 0);
            
        if (totalAvailableWeight < weightToSell) {
            throw new Error(`Not enough of material static ID '${materialStaticId}' in stock.`);
        }
        
        material.adjustAvailability(-weightToSell);
        const totalCost = material.costPerKg * weightToSell;
        const currency = await this.currencyRepo.getDefaultCurrency();
        return { amount: totalCost, currency: currency?.code || 'D', materialId: material.id };
    }

    public updateMaterialPrice(materialStaticId: number, newPrice: number): void {
        // Update all materials of this static type
        const materials = this.rawMaterials.filter(m => m.material_static_id === materialStaticId);
        if (materials.length === 0) {
            throw new Error(`Raw material with static ID '${materialStaticId}' not found.`);
        }
        materials.forEach(material => material.updatePrice(newPrice));
    }

    public applyDailyRandomness() {
        for (const material of this.rawMaterials) {
            // Randomize price (e.g., ±10%)
            const priceChange = 1 + (Math.random() - 0.5) * 0.2;
            material.costPerKg = Math.max(1, Math.round(material.costPerKg * priceChange * 100) / 100);
            // Optionally randomize availableWeight (e.g., simulate supply changes)
            // const weightChange = 1 + (Math.random() - 0.5) * 0.1;
            // material.availableWeight = Math.max(0, Math.round(material.availableWeight * weightChange));
        }
    }

    public getRawMaterials(): RawMaterial[] {
        return this.rawMaterials;
    }
}

export class MachinesMarket {
    private machinesForSale: Map<number, Machine>;
    private machineIdCounter = 1000;

    constructor(initialMachines: Machine[]) {
        this.machinesForSale = new Map(initialMachines.map(m => [m.id as number, m]));
    }

    public sellMachine(machineId: number): Machine {
        const machine = this.machinesForSale.get(machineId);
        if (!machine) {
            throw new Error(`Machine with ID '${machineId}' not for sale.`);
        }
        machine.sold = true;
        return machine;
    }

    public applyDailyRandomness() {
        for (const machine of this.machinesForSale.values()) {
            if (!Number.isFinite(machine.cost.amount) || isNaN(machine.cost.amount)) {
                throw new Error('Machine has invalid cost before randomness');
            }
            const change = 1 + (Math.random() - 0.5) * 0.2;
            machine.cost.amount = Math.max(1000, Math.floor(machine.cost.amount * change));
            if (!Number.isFinite(machine.cost.amount) || isNaN(machine.cost.amount)) {
                throw new Error('Invalid machine cost after randomness');
            }
        }
    }

    public getMachinesForSale(): Machine[] {
        return Array.from(this.machinesForSale.values()).filter(m => !m.sold);
    }
}

export class TrucksMarket {
    private trucksForSale: Map<number, Truck>;

    constructor(initialTrucks: Truck[]) {
        this.trucksForSale = new Map(initialTrucks.filter(t => t.id !== undefined).map(t => [t.id as number, t]));
    }

    public sellTruck(truckId: number): Truck {
        const truck = this.trucksForSale.get(truckId);
        if (!truck) {
            throw new Error(`Truck with ID '${truckId}' not for sale.`);
        }
        truck.sold = true;
        return truck;
    }

    public applyDailyRandomness() {
        for (const truck of this.trucksForSale.values()) {
            const change = 1 + (Math.random() - 0.5) * 0.2;
            truck.cost.amount = Math.max(1000, Math.floor(truck.cost.amount * change));
            if (!Number.isFinite(truck.cost.amount) || isNaN(truck.cost.amount)) {
                throw new Error('Invalid truck cost after randomness');
            }
            const opChange = 1 + (Math.random() - 0.5) * 0.1;
            truck.operatingCostPerDay.amount = Math.max(100, Math.floor(truck.operatingCostPerDay.amount * opChange));
            if (!Number.isFinite(truck.operatingCostPerDay.amount) || isNaN(truck.operatingCostPerDay.amount)) {
                throw new Error('Invalid truck operating cost after randomness');
            }
        }
    }

    public getTrucksForSale(): Truck[] {
        return Array.from(this.trucksForSale.values()).filter(t => !t.sold);
    }
}