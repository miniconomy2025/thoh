import { Machine, Truck } from "../../domain/market/equipment.entity";
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from "../../domain/market/market.aggregate";
import { RawMaterial } from "../../domain/market/raw-material.entity";
import { Person } from "../../domain/population/person.entity";
import { Population } from "../../domain/population/population.aggregate";
import { Money } from "../../domain/shared/value-objects";
import { Simulation } from "../../domain/simulation/simulation.aggregate";
import { IMarketRepository, IPopulationRepository, ISimulationRepository } from "../ports/repository.ports";
import { MachineType, RawMaterialType, TruckType } from "../../domain/market/market.types";
import { Weight } from "../../domain/shared/value-objects";
import { getMarketConfig } from "../../domain/shared/config";

function randomMoney(min: number, max: number): Money {
    return { amount: Math.floor(Math.random() * (max - min + 1)) + min, currency: 'ZAR' };
}

function randomWeight(min: number, max: number): Weight {
    return { value: Math.floor(Math.random() * (max - min + 1)) + min, unit: 'kg' };
}

function randomRatio(): number {
    return Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
}

export interface StartSimulationInput {
    numberOfPeople: number;
    initialFunds: Money;
    baseSalary: Money;
}

export class StartSimulationUseCase {
    constructor(
        private readonly simulationRepo: ISimulationRepository,
        private readonly marketRepo: IMarketRepository,
        private readonly populationRepo: IPopulationRepository,
        private readonly bankService?: any // Optional, for initial investment
    ) {}

    public async execute(): Promise<{ simulationId: number }> {
        const simulation = new Simulation();
        const simulationId =  await this.simulationRepo.save(simulation);
        simulation.start();

        const { rawMaterialsMarket, machinesMarket, trucksMarket } = this.createSeededMarkets();
        // const population = this.createSeededPopulation(input.numberOfPeople, input.baseSalary, simulationId);

        // if (this.bankService && input.initialFunds) {
            // await this.bankService.depositToTreasury(input.initialFunds);
        // }

        await Promise.all([
            this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket),
            this.marketRepo.saveMachinesMarket(machinesMarket),
            this.marketRepo.saveTrucksMarket(trucksMarket),
            // this.populationRepo.save(population)
        ]);
        return { simulationId };
    }

    private createSeededMarkets(): { rawMaterialsMarket: RawMaterialsMarket, machinesMarket: MachinesMarket, trucksMarket: TrucksMarket } {
        const marketConfig = getMarketConfig();
        const initialMaterials = marketConfig.rawMaterials.map(
            m => new RawMaterial(
                m.name as RawMaterialType,
                m.costPerKg,
                m.initialWeight
            )
        );
        const initialMachines = this.createRandomMachines();
        const initialTrucks = this.createRandomTrucks();
        return {
            rawMaterialsMarket: new RawMaterialsMarket(initialMaterials),
            machinesMarket: new MachinesMarket(initialMachines),
            trucksMarket: new TrucksMarket(initialTrucks)
        };
    }

    private createRandomMachines(): Machine[] {
        const marketConfig = getMarketConfig();
        const machines: Machine[] = [];
        let machineId = 0;
        
        for (const machineConfig of marketConfig.machines) {
            const instances = Math.floor(Math.random() * 3) + 2; // 2-4 instances
            
            for (let i = 0; i < instances; i++) {
                const costVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
                const weightVariation = 0.9 + (Math.random() * 0.2); // ±10% variation
                
                const cost = {
                    amount: Math.floor(machineConfig.baseCost * costVariation),
                    currency: 'ZAR'
                };
                
                const weight: Weight = {
                    value: Math.floor(machineConfig.baseWeight * weightVariation),
                    unit: 'kg'
                };
                
                if (!cost || typeof cost.amount !== 'number' || isNaN(cost.amount)) {
                    console.error('[ERROR] Invalid cost generated for machine:', machineConfig.type);
                    throw new Error('Invalid cost generated for machine');
                }
                
                const machine = new Machine(
                    machineConfig.type as MachineType,
                    cost,
                    weight,
                    machineConfig.materialRatio,
                    machineConfig.productionRate,
                    1, // quantity
                    machineId++
                );
                machines.push(machine);
            }
        }
        
        console.log(`[SIMULATION] Created ${machines.length} machines of ${marketConfig.machines.length} different types`);
        return machines;
    }

    private createRandomTrucks(): Truck[] {
        const truckTypes: TruckType[] = ['large_truck', 'medium_truck', 'small_truck'];
        const trucks: Truck[] = [];
        
        for (let i = 0; i < 3; i++) { 
            const type = truckTypes[i];
            const truck = new Truck(
                type,
                randomMoney(30000, 70000),
                randomWeight(1500, 2500),
                randomMoney(800, 1500),
                1, // quantity
                i
            );
            trucks.push(truck);
        }
        
        return trucks;
    }

    private createSeededPopulation(numberOfPeople: number, baseSalary: Money, simulationId: string): Population | null{
        const people: Person[] = [];
        
        for (let i = 0; i < numberOfPeople; i++) {
            const personId = `person_${i}`;
            const bankAccountId = `bank_${personId}`;
            // Vary salary slightly for realism
            const salaryAmount = baseSalary.amount * (1 + (Math.random() - 0.5) * 0.2);
            const salary: Money = { amount: salaryAmount, currency: baseSalary.currency };
            
            // people.push(new Person(personId, bankAccountId, salary));?
        }
        
        // return new Population(people);?
        return null
    }
}