import { Machine, Vehicle } from "./equipment.entity";
import { RawMaterialType, MachineType, VehicleType } from "./market.types";
import { RawMaterial } from "./raw-material.entity";
import { getMarketConfig } from '../shared/config';
import { PgCurrencyRepository } from "../../infrastructure/persistence/postgres/currency.repository";
export class RawMaterialsMarket {
    private rawMaterials: Map<RawMaterialType, RawMaterial>;
    private currencyRepo: PgCurrencyRepository;

    constructor(initialMaterials: RawMaterial[]) {
        this.rawMaterials = new Map(initialMaterials.map(m => [m.name as RawMaterialType, m]));
        this.currencyRepo = new PgCurrencyRepository();
    }

    public async sellRawMaterial(materialType: RawMaterialType, weightToSell: { value: number, unit: string }): Promise<{ amount: number, currency: string }> {
        const material = this.rawMaterials.get(materialType);
        if (!material) {
            throw new Error(`Raw material '${materialType}' not found in the market.`);
        }
        if (material.availableWeight < weightToSell.value) {
            throw new Error(`Not enough ${materialType} in stock.`);
        }
        material.adjustAvailability(-weightToSell.value);
        const totalCost = material.costPerKg * weightToSell.value;
        const currency = await this.currencyRepo.getDefaultCurrency();
        return { amount: totalCost, currency: currency?.code || 'D' };
    }

    public updateMaterialPrice(materialType: RawMaterialType, newPrice: number): void {
        const material = this.rawMaterials.get(materialType);
        if (!material) {
            throw new Error(`Raw material '${materialType}' not found.`);
        }
        material.updatePrice(newPrice);
    }

    public applyDailyRandomness() {
        const config = getMarketConfig();
        for (const material of this.rawMaterials.values()) {
            const change = 1 + (Math.random() - 0.5) * 0.2;
            let newPrice = material.costPerKg * change;
            if (!Number.isFinite(newPrice) || isNaN(newPrice)) {
                newPrice = 1;
            }
            newPrice = Math.max(1, newPrice);
            material.updatePrice(newPrice);
            const availChange = 1 + (Math.random() - 0.5) * 0.1;
            material.adjustAvailability(material.availableWeight * (availChange - 1));
        }
    }

    public getRawMaterials(): RawMaterial[] {
        return Array.from(this.rawMaterials.values());
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
            console.debug('[DEBUG] Machine before randomness:', machine);
            if (!Number.isFinite(machine.cost.amount) || isNaN(machine.cost.amount)) {
                console.error('[ERROR] Machine has invalid cost before randomness:', machine);
                throw new Error('Machine has invalid cost before randomness');
            }
            const change = 1 + (Math.random() - 0.5) * 0.2;
            machine.cost.amount = Math.max(1000, Math.floor(machine.cost.amount * change));
            if (!Number.isFinite(machine.cost.amount) || isNaN(machine.cost.amount)) {
                console.error('[ERROR] Invalid machine cost after randomness:', machine);
                throw new Error('Invalid machine cost after randomness');
            }
            console.debug('[DEBUG] Machine after randomness:', machine);
        }
    }

    public getMachinesForSale(): Machine[] {
        return Array.from(this.machinesForSale.values()).filter(m => !m.sold);
    }
}

export class VehiclesMarket {
    private vehiclesForSale: Map<number, Vehicle>;

    constructor(initialVehicles: Vehicle[]) {
        this.vehiclesForSale = new Map(initialVehicles.filter(v => v.id !== undefined).map(v => [v.id as number, v]));
    }

    public sellVehicle(vehicleId: number): Vehicle {
        const vehicle = this.vehiclesForSale.get(vehicleId);
        if (!vehicle) {
            throw new Error(`Vehicle with ID '${vehicleId}' not for sale.`);
        }
        vehicle.sold = true;
        return vehicle;
    }

    public applyDailyRandomness() {
        for (const vehicle of this.vehiclesForSale.values()) {
            const change = 1 + (Math.random() - 0.5) * 0.2;
            vehicle.cost.amount = Math.max(1000, Math.floor(vehicle.cost.amount * change));
            if (!Number.isFinite(vehicle.cost.amount) || isNaN(vehicle.cost.amount)) {
                console.error('[ERROR] Invalid vehicle cost after randomness:', vehicle);
                throw new Error('Invalid vehicle cost after randomness');
            }
            const opChange = 1 + (Math.random() - 0.5) * 0.1;
            vehicle.operatingCostPerDay.amount = Math.max(100, Math.floor(vehicle.operatingCostPerDay.amount * opChange));
            if (!Number.isFinite(vehicle.operatingCostPerDay.amount) || isNaN(vehicle.operatingCostPerDay.amount)) {
                console.error('[ERROR] Invalid vehicle operating cost after randomness:', vehicle);
                throw new Error('Invalid vehicle operating cost after randomness');
            }
        }
    }

    public getVehiclesForSale(): Vehicle[] {
        return Array.from(this.vehiclesForSale.values()).filter(v => !v.sold);
    }
}