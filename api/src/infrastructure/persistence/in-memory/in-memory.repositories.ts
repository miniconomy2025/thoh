import { IMarketRepository, IPopulationRepository, ISimulationRepository } from "../../../application/ports/repository.ports";
import { RawMaterialsMarket, MachinesMarket, VehiclesMarket } from "../../../domain/market/market.aggregate";
import { Population } from "../../../domain/population/population.aggregate";
import { Simulation } from "../../../domain/simulation/simulation.aggregate";
import { Machine, Vehicle } from "../../../domain/market/equipment.entity";
import { MachineType, VehicleType } from "../../../domain/market/market.types";
import { RawMaterial } from "../../../domain/market/raw-material.entity";
import { Person } from "../../../domain/population/person.entity";
import { Money, Weight, Ratio } from "../../../domain/shared/value-objects";
import { getMarketConfig } from "../../../domain/shared/config";

function randomMoney(min: number, max: number): Money {
    return { amount: Math.floor(Math.random() * (max - min + 1)) + min, currency: 'ZAR' };
}

function randomWeight(min: number, max: number): Weight {
    return { value: Math.floor(Math.random() * (max - min + 1)) + min, unit: 'kg' };
}

function randomRatio(): number {
    // Example: random ratio between 0.1 and 1.0
    return Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
}

export class InMemorySimulationRepository implements ISimulationRepository {
    private simulations = new Map<string, Simulation>();

    public async findById(simulationId: string): Promise<Simulation | null> {
        const simulation = this.simulations.get(simulationId);
        return simulation || null;
    }

    public async save(simulation: Simulation): Promise<void> {
        this.simulations.set(simulation.simulationId, simulation);
    }
}

export class InMemoryMarketRepository implements IMarketRepository {
    private rawMaterialsMarket: RawMaterialsMarket | null = null;
    private machinesMarket: MachinesMarket | null = null;
    private vehiclesMarket: VehiclesMarket | null = null;

    public async findRawMaterialsMarket(marketId: number): Promise<RawMaterialsMarket | null> {
        // TODO: Implement lookup by marketId if needed
        return null;
    }
    public async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
        this.rawMaterialsMarket = market;
    }
    public async findMachinesMarket(marketId: number): Promise<MachinesMarket | null> {
        // TODO: Implement lookup by marketId if needed
        return null;
    }
    public async saveMachinesMarket(market: MachinesMarket): Promise<void> {
        this.machinesMarket = market;
    }
    public async findVehiclesMarket(marketId: number): Promise<VehiclesMarket | null> {
        // TODO: Implement lookup by marketId if needed
        return null;
    }
    public async saveVehiclesMarket(market: VehiclesMarket): Promise<void> {
        this.vehiclesMarket = market;
    }
}

export class InMemoryPopulationRepository implements IPopulationRepository {
    private population: Population | null = null;

    public async find(): Promise<Population | null> {
        return this.population;
    }

    public async save(population: Population): Promise<void> {
        console.log('[Population Change] Saving population data:', {
            people: population.getPeople()
        });
        this.population = population;
    }
}