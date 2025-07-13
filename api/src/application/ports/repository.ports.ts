import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from "../../domain/market/market.aggregate";
import { Population as PopulationEntity } from '../../domain/population/population.entity';
import { Simulation } from "../../domain/simulation/simulation.aggregate";
import { Order } from "../../domain/market/order.entity";
import { Collection } from '../../domain/market/collection.entity';
import { Person } from "../../domain/population/person.entity";

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
    saveCollection(collection: Collection): Promise<Collection>;
    findCollectionByOrderId(orderId: number): Promise<Collection | null>;
    getAllCollections(): Promise<Collection[]>;
    markCollectionAsCollected(orderId: number): Promise<void>;
    collectFromCollection(orderId: number, collectQuantity: number): Promise<Collection>;
    
    // Inventory update methods
    markTrucksAsSold(vehicleStaticId: number, quantity: number): Promise<number[]>;
    markMachinesAsSold(machineStaticId: number, quantity: number): Promise<number[]>;
    reduceRawMaterialWeight(materialName: string, weightToReduce: number): Promise<number>;
    findLatestRawMaterialsMarket(): Promise<RawMaterialsMarket | null>;
    findLatestMachinesMarket(): Promise<MachinesMarket | null>;
    findLatestTrucksMarket(): Promise<TrucksMarket | null>;
    findMachineById(id: number): Promise<any>;
    findTruckById(id: number): Promise<any>;
}

export interface IPopulationRepository {
    find(): Promise<PopulationEntity | null>;
    save(population: PopulationEntity): Promise<void>;
    updatePerson(person:Person): Promise<void>;
}