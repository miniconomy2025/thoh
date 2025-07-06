import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from "../../domain/market/market.aggregate";
import { Population } from "../../domain/population/population.aggregate";
import { Simulation } from "../../domain/simulation/simulation.aggregate";
import { Order } from "../../domain/market/order.entity";

export interface ISimulationRepository {
    findById(simulationId: number): Promise<Simulation | null>;
    save(simulation: Simulation): Promise<number>;
}

export interface IMarketRepository {
    findRawMaterialsMarket(): Promise<RawMaterialsMarket | null>;
    saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void>;
    findMachinesMarket(): Promise<MachinesMarket | null>;
    saveMachinesMarket(market: MachinesMarket): Promise<void>;
    findTrucksMarket(): Promise<TrucksMarket | null>;
    saveTrucksMarket(market: TrucksMarket): Promise<void>;
    createMarket(simulationId: number): Promise<number>;
    
    // Order repository methods
    saveOrder(order: Order): Promise<Order>;
    findOrderById(orderId: number): Promise<Order | null>;
    getAllOrders(): Promise<Order[]>;
    
    // Collection repository methods
    saveCollection(collection: any): Promise<any>;
    findCollectionByOrderId(orderId: number): Promise<any | null>;
    getAllCollections(): Promise<any[]>;
    markCollectionAsCollected(orderId: number): Promise<void>;
    
    // Inventory update methods
    markTrucksAsSold(truckType: string, quantity: number): Promise<number[]>;
    markMachinesAsSold(machineType: string, quantity: number): Promise<number[]>;
    reduceRawMaterialWeight(materialName: string, weightToReduce: number): Promise<number>;
}

export interface IPopulationRepository {
    find(): Promise<Population | null>;
    save(population: Population): Promise<void>;
}