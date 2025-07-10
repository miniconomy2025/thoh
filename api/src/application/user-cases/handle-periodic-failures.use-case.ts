import axios, { AxiosError } from 'axios';
import { IMarketRepository } from '../ports/repository.ports';
import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { failureNotificationConfig } from '../../infrastructure/config/failure-notification.config';
import { bankRateConfig } from '../../infrastructure/config/bank-rate.config';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { UpdateBankPrimeRateUseCase } from './update-bank-prime-rate.use-case';

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
        // Check if it's time for weekly failures (every 7 days)
        if (simulation.currentDay % 7 === 0) {
            await this.handleMachineFailures(simulation);
            await this.handleTruckFailures(simulation);
        }

        // Check if it's time for bank rate update (every 30 days)
        if (simulation.currentDay % 1 === 0) {
            await this.handleBankRateUpdate(simulation);
        }
    }

    private async handleBankRateUpdate(simulation: Simulation): Promise<void> {
        try {
            const { primeRate } = this.updateBankPrimeRateUseCase.execute();
            
            // Send to bank rate update webhook if configured
            if (bankRateConfig.bankRateUpdateUrl) {
                const updateEvent = {
                    primeRate,
                    simulationDate: simulation.getCurrentSimDateString(),
                    simulationTime: simulation.getCurrentSimTime()
                };

                await axios.post(bankRateConfig.bankRateUpdateUrl, updateEvent);
                console.log(`Bank prime rate updated to ${primeRate}%`);
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('Failed to update bank prime rate:', axiosError.message);
        }
    }

    private async handleMachineFailures(simulation: Simulation): Promise<void> {
        try {
            // Get all available machines
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

            // Generate and send unique failures for each URL
            const sendPromises = failureNotificationConfig.machineFailureUrls.map(async (targetUrl: string) => {
                try {
                    // Generate unique random failure for each URL
                    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
                    const staticData = staticLookup.get(randomMachine.machineStaticId);
                    if (!staticData) {
                        console.error(`Static data not found for machine ${randomMachine.machineStaticId}`);
                        return;
                    }
                    const failureQuantity = Math.floor(Math.random() * 10) + 1;

                    // Create failure event data
                    const failureEvent = {
                        machineName: staticData.name,
                        failureQuantity: failureQuantity,
                        simulationDate: simulation.getCurrentSimDateString(),
                        simulationTime: simulation.getCurrentSimTime()
                    };

                    // Send to the specific URL
                    await axios.post(targetUrl, failureEvent);
                    console.log(`Machine failure event sent to ${targetUrl}`);
                } catch (error: unknown) {
                    const axiosError = error as AxiosError;
                    console.error(`Failed to handle machine failure for ${targetUrl}:`, axiosError.message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`Machine failure events processed for ${failureNotificationConfig.machineFailureUrls.length} applications`);
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('Error handling machine failures:', axiosError.message);
        }
    }

    private async handleTruckFailures(simulation: Simulation): Promise<void> {
        try {
            // Get all available trucks
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

            // Generate and send unique failures for each URL
            const sendPromises = failureNotificationConfig.truckFailureUrls.map(async (targetUrl: string) => {
                try {
                    // Generate unique random failure for each URL
                    const randomTruck = trucks[Math.floor(Math.random() * trucks.length)];
                    const staticData = staticLookup.get(randomTruck.vehicleStaticId);
                    if (!staticData) {
                        console.error(`Static data not found for truck ${randomTruck.vehicleStaticId}`);
                        return;
                    }
                    const failureQuantity = Math.floor(Math.random() * 5) + 1;

                    // Create failure event data
                    const failureEvent = {
                        truckName: staticData.name,
                        failureQuantity: failureQuantity,
                        simulationDate: simulation.getCurrentSimDateString(),
                        simulationTime: simulation.getCurrentSimTime()
                    };

                    // Send to the specific URL
                    await axios.post(targetUrl, failureEvent);
                    console.log(`Truck failure event sent to ${targetUrl}`);
                } catch (error: unknown) {
                    const axiosError = error as AxiosError;
                    console.error(`Failed to handle truck failure for ${targetUrl}:`, axiosError.message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`Truck failure events processed for ${failureNotificationConfig.truckFailureUrls.length} applications`);
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error('Error handling truck failures:', axiosError.message);
        }
    }
} 