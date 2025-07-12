import { IMarketRepository } from '../ports/repository.ports';
import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { UpdateBankPrimeRateUseCase } from './update-bank-prime-rate.use-case';
import { QueueFactory } from '../../infrastructure/queue/queue.factory';

export class HandlePeriodicFailuresUseCase {
    private readonly machineStaticRepo: MachineStaticRepository;
    private readonly vehicleStaticRepo: VehicleStaticRepository;
    private readonly updateBankPrimeRateUseCase: UpdateBankPrimeRateUseCase;

    constructor(
        private readonly marketRepo: IMarketRepository
    ) {
        this.machineStaticRepo = new MachineStaticRepository();
        this.vehicleStaticRepo = new VehicleStaticRepository();
        this.updateBankPrimeRateUseCase = new UpdateBankPrimeRateUseCase();
    }

    async execute(simulation: Simulation): Promise<void> {
        // Check if it's time for weekly failures (every 14 days)
        if (simulation.currentDay % 14 === 0) {
            await this.handleMachineFailures(simulation);
            await this.handleTruckFailures(simulation);
        }

        // Check if it's time for bank rate update (every 30 days)
        if (simulation.currentDay % 30 === 0) {
            await this.handleBankRateUpdate(simulation);
        }
    }

    private async handleBankRateUpdate(simulation: Simulation): Promise<void> {
        try {
            const { primeRate } = this.updateBankPrimeRateUseCase.execute();
            const criticalQueue = QueueFactory.getCriticalQueue();

            await criticalQueue.sendMessage({
                body: {
                    type: 'bank_rate_update',
                    payload: {
                        primeRate,
                        simulationDate: simulation.getCurrentSimDateString(),
                        simulationTime: simulation.getCurrentSimTime()
                    }
                }
            });

            console.log(`Bank prime rate update queued: ${primeRate}%`);
        } catch (error: unknown) {
            console.error('Failed to queue bank rate update:', (error as Error).message);
        }
    }

    private async handleMachineFailures(simulation: Simulation): Promise<void> {
        try {
            const machinesMarket = await this.marketRepo.findMachinesMarket();
            if (!machinesMarket) {
                console.log('Machines market not found');
                return;
            }

            const machines = machinesMarket.getMachinesForSale();
            if (!machines || machines.length === 0) {
                console.log('No machines available for failure event');
                return;
            }

            // Get static machine data
            const staticMachines = await this.machineStaticRepo.findAll();
            const staticLookup = new Map(staticMachines.map(sm => [sm.id, sm]));

            const notificationQueue = QueueFactory.getNotificationQueue();
            const randomMachine = machines[Math.floor(Math.random() * machines.length)];
            const staticData = staticLookup.get(randomMachine.machineStaticId);
            
            if (!staticData) {
                console.error(`Static data not found for machine ${randomMachine.machineStaticId}`);
                return;
            }

            const failureQuantity = Math.floor(Math.random() * 10) + 1;

            await notificationQueue.sendMessage({
                body: {
                    type: 'machine_failure',
                    payload: {
                        itemName: staticData.name,
                        failureQuantity,
                        simulationDate: simulation.getCurrentSimDateString(),
                        simulationTime: simulation.getCurrentSimTime()
                    }
                }
            });

            console.log('Machine failure event queued');
        } catch (error: unknown) {
            console.error('Failed to handle machine failures:', (error as Error).message);
        }
    }

    private async handleTruckFailures(simulation: Simulation): Promise<void> {
        try {
            const trucksMarket = await this.marketRepo.findTrucksMarket();
            if (!trucksMarket) {
                console.log('Trucks market not found');
                return;
            }

            const trucks = trucksMarket.getTrucksForSale();
            if (!trucks || trucks.length === 0) {
                console.log('No trucks available for failure event');
                return;
            }

            // Get static truck data
            const staticTrucks = await this.vehicleStaticRepo.findAll();
            const staticLookup = new Map(staticTrucks.map(st => [st.id, st]));

            const notificationQueue = QueueFactory.getNotificationQueue();
            const randomTruck = trucks[Math.floor(Math.random() * trucks.length)];
            const staticData = staticLookup.get(randomTruck.vehicleStaticId);

            if (!staticData) {
                console.error(`Static data not found for truck ${randomTruck.vehicleStaticId}`);
                return;
            }

            const failureQuantity = Math.floor(Math.random() * 5) + 1;

            await notificationQueue.sendMessage({
                body: {
                    type: 'truck_failure',
                    payload: {
                        itemName: staticData.name,
                        failureQuantity,
                        simulationDate: simulation.getCurrentSimDateString(),
                        simulationTime: simulation.getCurrentSimTime()
                    }
                }
            });

            console.log('Truck failure event queued');
        } catch (error: unknown) {
            console.error('Failed to handle truck failures:', (error as Error).message);
        }
    }
} 