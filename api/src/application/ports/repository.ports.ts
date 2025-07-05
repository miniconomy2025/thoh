import { RawMaterialsMarket, MachinesMarket, VehiclesMarket } from "../../domain/market/market.aggregate";
import { Population } from "../../domain/population/population.aggregate";
import { Simulation } from "../../domain/simulation/simulation.aggregate";

export interface ISimulationRepository {
    findById(simulationId: number): Promise<Simulation | null>;
    save(simulation: Simulation): Promise<number>;
}

export interface IMarketRepository {
    findRawMaterialsMarket(marketId: number): Promise<RawMaterialsMarket | null>;
    saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void>;
    findMachinesMarket(marketId: number): Promise<MachinesMarket | null>;
    saveMachinesMarket(market: MachinesMarket): Promise<void>;
    findVehiclesMarket(marketId: number): Promise<VehiclesMarket | null>;
    saveVehiclesMarket(market: VehiclesMarket): Promise<void>;
    createMarket(simulationId: number): Promise<number>;
}

export interface IPopulationRepository {
    find(): Promise<Population | null>;
    save(population: Population): Promise<void>;
}