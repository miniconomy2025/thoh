import axios, { AxiosError } from 'axios';
import { IMarketRepository } from '../ports/repository.ports';
import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { failureNotificationConfig } from '../../infrastructure/config/failure-notification.config';

export class HandlePeriodicFailuresUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository
    ) {}

    async execute(simulation: Simulation): Promise<void> {
        // Check if it's time for weekly failures (every 7 days)
        if (simulation.currentDay % 1 === 0) {
            await this.handleMachineFailures(simulation);
            await this.handleTruckFailures(simulation);
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

            // Generate and send unique failures for each URL
            const sendPromises = failureNotificationConfig.machineFailureUrls.map(async (targetUrl: string) => {
                try {
                    // Generate unique random failure for each URL
                    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
                    const failureQuantity = Math.floor(Math.random() * 10) + 1;

                    // Create failure event data
                    const failureEvent = {
                        machineName: randomMachine.machineName,
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

            // Generate and send unique failures for each URL
            const sendPromises = failureNotificationConfig.truckFailureUrls.map(async (targetUrl: string) => {
                try {
                    // Generate unique random failure for each URL
                    const randomTruck = trucks[Math.floor(Math.random() * trucks.length)];
                    const failureQuantity = Math.floor(Math.random() * 5) + 1;

                    // Create failure event data
                    const failureEvent = {
                        truckName: randomTruck.truckName,
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