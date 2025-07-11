import { Machine, Truck } from "../../domain/market/equipment.entity";
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from "../../domain/market/market.aggregate";
import { RawMaterial } from "../../domain/market/raw-material.entity";
import { Person } from "../../domain/population/person.entity";
import { Population } from "../../domain/population/population.entity"; // Use the entity, not the aggregate
import { Money } from "../../domain/shared/value-objects";
import { Simulation } from "../../domain/simulation/simulation.aggregate";
import { IMarketRepository, IPopulationRepository, ISimulationRepository } from "../ports/repository.ports";
import { RawMaterialType } from "../../domain/market/market.types";
import { Weight } from "../../domain/shared/value-objects";
import { getMarketConfig } from "../../domain/shared/config";
import { MaterialStaticRepository } from '../../infrastructure/persistence/postgres/material-static.repository';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { Phone } from "../../domain/population/phone.entity";
import { PhoneStatic } from "../../domain/population/phone-static.entity";
import { PhoneStaticRepository } from '../../infrastructure/persistence/postgres/phone-static.repository';
import { PersonRepository } from '../../infrastructure/persistence/postgres/person.repository';
import { CreateAccountUseCase } from "./create-account.use-case";
import { NotifySimulationEpochUseCase } from './notify-simulation-epoch.use-case';

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
        private readonly bankService?: any, // Optional, for initial investment
        private readonly materialStaticRepo = new MaterialStaticRepository(),
        private readonly machineStaticRepo = new MachineStaticRepository(),
        private readonly vehicleStaticRepo = new VehicleStaticRepository(),
        private readonly phoneStaticRepo = new PhoneStaticRepository(),
        private readonly notifySimulationEpochUseCase = new NotifySimulationEpochUseCase()
    ) {}

    public async execute(): Promise<{ simulationId: number }> {
        const simulation = new Simulation();
        simulation.start();  // Start first to set unix epoch time
        const simulationId = await this.simulationRepo.save(simulation);  // Then save

        // Notify about the epoch time
        await this.notifySimulationEpochUseCase.execute(simulation);

        // Fetch static tables from the database
        const materialStatics = await this.materialStaticRepo.findAll();
        const machineStatics = await this.machineStaticRepo.findAll();
        const vehicleStatics = await this.vehicleStaticRepo.findAll();
        const phoneStatics = await this.phoneStaticRepo.findAll();
        const materialNameToId = new Map(materialStatics.map(m => [m.name, m.id]));
        const machineNameToId = new Map(machineStatics.map(m => [m.name, m.id]));
        const vehicleNameToId = new Map(vehicleStatics.map(v => [v.name, v.id]));

        const { rawMaterialsMarket, machinesMarket, trucksMarket } = this.createSeededMarkets(materialNameToId, machineNameToId, vehicleNameToId);
        const people = this.createSeededPopulation(1000, { amount: 1000, currency: 'ZAR' }, simulationId, phoneStatics);
        console.log(JSON.stringify({
            people: people,
            rawMaterialsMarket: rawMaterialsMarket,
            machinesMarket: machinesMarket,
            trucksMarket: trucksMarket,
        }));
        const accounts = people.map(person => {
            return this.createAccount(person, simulationId);
        });

        // Save all new phones first
        const phonesToSave = people
          .map(p => p.phone)
          .filter((phone): phone is Phone => !!phone);
        if (phonesToSave.length > 0) {
          await PersonRepository.getRepo().manager.getRepository(Phone).save(phonesToSave);
        }

        // if (this.bankService && input.initialFunds) {
            // await this.bankService.depositToTreasury(input.initialFunds);
        // }

        const savedAccounts = await Promise.all(accounts);

        await Promise.all([
            this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket),
            this.marketRepo.saveMachinesMarket(machinesMarket),
            this.marketRepo.saveTrucksMarket(trucksMarket),
            PersonRepository.getRepo().save(people)
        ]);
        return { simulationId };
    }

    private createSeededMarkets(materialNameToId: Map<string, number>, machineNameToId: Map<string, number>, vehicleNameToId: Map<string, number>) {
        const marketConfig = getMarketConfig();
        const initialMaterials = marketConfig.rawMaterials.map(
            m => new RawMaterial(
                materialNameToId.get(m.name)!,
                m.costPerKg,
                m.initialWeight
            )
        );
        const initialMachines = this.createRandomMachines(machineNameToId);
        const initialTrucks = this.createRandomTrucks(vehicleNameToId);
        return {
            rawMaterialsMarket: new RawMaterialsMarket(initialMaterials),
            machinesMarket: new MachinesMarket(initialMachines),
            trucksMarket: new TrucksMarket(initialTrucks)
        };
    }

    private createRandomMachines(machineNameToId: Map<string, number>): Machine[] {
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
                // Parse materialRatio string and description into an object
                let materialRatioObj: Record<string, number> = {};
                if (machineConfig.materialRatio && machineConfig.materialRatioDescription) {
                    const ratioParts = machineConfig.materialRatio.split(':').map(Number);
                    const descParts = machineConfig.materialRatioDescription.split(':').map(s => s.trim());
                    if (ratioParts.length === descParts.length) {
                        for (let i = 0; i < descParts.length; i++) {
                            materialRatioObj[descParts[i]] = ratioParts[i];
                        }
                    }
                } else if (machineConfig.materialRatio === 'any_phone') {
                    materialRatioObj = { any_phone: 1 };
                }
                const machine = new Machine(
                    machineNameToId.get(machineConfig.type)!,
                    cost,
                    weight,
                    materialRatioObj,
                    machineConfig.productionRate,
                    1, // quantity
                    machineId++,
                    false
                );
                machines.push(machine);
            }
        }
        return machines;
    }

    private createRandomTrucks(vehicleNameToId: Map<string, number>): Truck[] {
        const truckTypes = ['large_truck', 'medium_truck', 'small_truck'];
        const trucks: Truck[] = [];
        for (let i = 0; i < 3; i++) { 
            const type = truckTypes[i];
            const truck = new Truck(
                vehicleNameToId.get(type)!,
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

    private createSeededPopulation(numberOfPeople: number, baseSalary: Money, simulationId: number, phoneModels: PhoneStatic[]): Person[] {
        const people: Person[] = [];
        for (let i = 0; i < numberOfPeople; i++) {
            // Vary salary slightly for realism
            const salaryAmount = baseSalary.amount * (1 + (Math.random() - 0.5) * 0.2);
            const salary: Money = { amount: salaryAmount, currency: baseSalary.currency };
            // 30% chance to have a phone
            let phone = null;
            if (phoneModels.length > 0 && Math.random() < 0.3) {
                const model = phoneModels[Math.floor(Math.random() * phoneModels.length)];
                phone = new Phone();
                phone.model = model;
                phone.isBroken = false;
            }
            const person = new Person(salary.amount, phone, true); // isAlive true
            people.push(person);
        }
        return people;
    }

    private async createAccount(person: Person, simulationId: number) {
        const createAccountUseCase = new CreateAccountUseCase(person);
        return createAccountUseCase.execute();
    }
}