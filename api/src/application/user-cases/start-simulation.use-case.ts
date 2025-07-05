import { Machine, Vehicle } from "../../domain/market/equipment.entity";
import { RawMaterialsMarket, MachinesMarket, VehiclesMarket } from "../../domain/market/market.aggregate";
import { RawMaterial } from "../../domain/market/raw-material.entity";
import { Person } from "../../domain/population/person.entity";
import { Population } from "../../domain/population/population.aggregate";
import { Money } from "../../domain/shared/value-objects";
import { Simulation } from "../../domain/simulation/simulation.aggregate";
import { IMarketRepository, IPopulationRepository, ISimulationRepository } from "../ports/repository.ports";
import { MachineType, RawMaterialType, VehicleType } from "../../domain/market/market.types";
import { Weight } from "../../domain/shared/value-objects";
import { getMarketConfig } from "../../domain/shared/config";

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

    public async execute(input: StartSimulationInput): Promise<{ simulationId: number, marketId: number }> {
        // 1. Create the Simulation aggregate
        const simulation = new Simulation();
        const simulationId =  await this.simulationRepo.save(simulation);
        simulation.start();

        // 2. Create a market in the database and get its id, linked to the simulation
        const marketId = await this.marketRepo.createMarket(simulationId);
       
        // 3. Create the split Market aggregates with seeded data using the marketId
        const { rawMaterialsMarket, machinesMarket, vehiclesMarket } = this.createSeededMarkets(marketId);
        // 4. Create the Population aggregate with seeded data
        // const population = this.createSeededPopulation(input.numberOfPeople, input.baseSalary, simulationId);

        // 5. Initial investment logic
        if (this.bankService && input.initialFunds) {
            await this.bankService.depositToTreasury(input.initialFunds);
        }

        await Promise.all([
            this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket),
            this.marketRepo.saveMachinesMarket(machinesMarket),
            this.marketRepo.saveVehiclesMarket(vehiclesMarket),
            // this.populationRepo.save(population)
        ]);
        return { simulationId, marketId };
    }

    private createSeededMarkets(marketId: number): { rawMaterialsMarket: RawMaterialsMarket, machinesMarket: MachinesMarket, vehiclesMarket: VehiclesMarket } {
        const marketConfig = getMarketConfig();
        const initialMaterials = marketConfig.rawMaterials.map(
            m => new RawMaterial(
                m.name as RawMaterialType,
                m.costPerKg,
                m.initialWeight,
                marketId
            )
        );
        const initialMachines = this.createRandomMachines(marketId);
        const initialVehicles = this.createRandomVehicles(marketId);
        return {
            rawMaterialsMarket: new RawMaterialsMarket(initialMaterials),
            machinesMarket: new MachinesMarket(initialMachines),
            vehiclesMarket: new VehiclesMarket(initialVehicles)
        };
    }

    private createRandomMachines(marketId: number): Machine[] {
        const machineTypes: MachineType[] = ['electronics_machine', 'case_machine', 'screen_machine', 'recycling_machine', 'ephone_machine', 'cosmos_machine'];
        const machines: Machine[] = [];
        
        for (let i = 0; i < 5; i++) { 
            const type = machineTypes[i];
            const cost = randomMoney(8000, 15000);
            if (!cost || typeof cost.amount !== 'number' || isNaN(cost.amount)) {
                console.error('[ERROR] Invalid cost generated for machine:', cost);
                throw new Error('Invalid cost generated for machine');
            }
            const machine = new Machine(
                type,
                cost,
                randomWeight(400, 800),
                randomRatio(),
                marketId,
                i
            );
            machines.push(machine);
        }
        
        return machines;
    }

    private createRandomVehicles(marketId: number): Vehicle[] {
        const vehicleTypes: VehicleType[] = ['large_truck', 'medium_truck', 'small_truck'];
        const vehicles: Vehicle[] = [];
        
        for (let i = 0; i < 3; i++) { 
            const type = vehicleTypes[i];
            const vehicle = new Vehicle(
                type,
                randomMoney(30000, 70000),
                randomWeight(1500, 2500),
                randomMoney(800, 1500),
                marketId,
                i
            );
            vehicles.push(vehicle);
        }
        
        return vehicles;
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