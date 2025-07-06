import { Machine, Truck } from "./equipment.entity";
import { RawMaterialType, MachineType, TruckType } from "./market.types";
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

    public async checkRawMaterialAvailability(materialName: string, weightToSell: number): Promise<{ amount: number, currency: string, materialId: number }> {
        const material = this.rawMaterials.find(m => m.name === materialName);
        if (!material) {
            throw new Error(`Raw material '${materialName}' not found in the market.`);
        }
        
        const totalAvailableWeight = this.rawMaterials
            .filter(m => m.name === materialName)
            .reduce((sum, m) => sum + m.availableWeight, 0);
            
        if (totalAvailableWeight < weightToSell) {
            throw new Error(`Not enough ${materialName} in stock.`);
        }
        
        const totalCost = material.costPerKg * weightToSell;
        const currency = await this.currencyRepo.getDefaultCurrency();
        return { amount: totalCost, currency: currency?.code || 'D', materialId: material.id };
    }

    public async sellRawMaterial(materialName: string, weightToSell: number): Promise<{ amount: number, currency: string, materialId: number }> {
        const material = this.rawMaterials.find(m => m.name === materialName);
        if (!material) {
            throw new Error(`Raw material '${materialName}' not found in the market.`);
        }
        const totalAvailableWeight = this.rawMaterials
            .filter(m => m.name === materialName)
            .reduce((sum, m) => sum + m.availableWeight, 0);
            
        if (totalAvailableWeight < weightToSell) {
            throw new Error(`Not enough ${materialName} in stock.`);
        }
        
        material.adjustAvailability(-weightToSell);
        const totalCost = material.costPerKg * weightToSell;
        const currency = await this.currencyRepo.getDefaultCurrency();
        return { amount: totalCost, currency: currency?.code || 'D', materialId: material.id };
    }

    public updateMaterialPrice(materialType: RawMaterialType, newPrice: number): void {
        // Update all materials of this type
        const materials = this.rawMaterials.filter(m => m.name === materialType);
        if (materials.length === 0) {
            throw new Error(`Raw material '${materialType}' not found.`);
        }
        materials.forEach(material => material.updatePrice(newPrice));
    }

    public applyDailyRandomness() {
        const config = getMarketConfig();
        for (const material of this.rawMaterials) {
            const priceChange = 1 + (Math.random() - 0.5) * 0.2;
            let newPrice = material.costPerKg * priceChange;
            if (!Number.isFinite(newPrice) || isNaN(newPrice)) {
                newPrice = 1;
            }
            newPrice = Math.max(1, newPrice);
            material.updatePrice(newPrice);
            
            const incrementalQuantity = Math.max(1, Math.floor( material.availableWeight * 0.02 * (0.8 + Math.random() * 0.4))); // 1.6% to 2.4%
            material.adjustAvailability(incrementalQuantity);
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
            console.debug('[DEBUG] Machine after randomness:', machine);
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