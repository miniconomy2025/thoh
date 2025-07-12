import { IMarketRepository } from '../ports/repository.ports';
import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { failureNotificationConfig } from '../../infrastructure/config/failure-notification.config';
import { bankRateConfig } from '../../infrastructure/config/bank-rate.config';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { UpdateBankPrimeRateUseCase } from './update-bank-prime-rate.use-case';
import { fetch } from 'undici';
import fs from 'fs';
import { Agent } from 'undici';
import path from "node:path";

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

            const agent = new Agent({
                connect: {
                    cert : fs.readFileSync(path.join(__dirname, 'thoh-client.crt')),
                    key : fs.readFileSync(path.join(__dirname, 'thoh-client.key')),
                    ca : fs.readFileSync(path.join(__dirname, 'root-ca.crt')),
                    rejectUnauthorized: false
                }
            });
            const { primeRate } = this.updateBankPrimeRateUseCase.execute();
            
            // Send to bank rate update webhook if configured
            if (bankRateConfig.bankRateUpdateUrl) {
                const updateEvent = {
                    primeRate,
                    simulationDate: simulation.getCurrentSimDateString(),
                    simulationTime: simulation.getCurrentSimTime()
                };

                const response = await fetch(bankRateConfig.bankRateUpdateUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateEvent),
                    dispatcher: agent
                });

                if (!response.ok) {
                    throw new Error(`Failed to update bank rate: ${response.statusText}`);
                }

                console.log(`Bank prime rate updated to ${primeRate}%`);
            }
        } catch (error: unknown) {
            console.error('Failed to update bank prime rate:', (error as Error).message);
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
                    const response = await fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(failureEvent)
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send machine failure: ${response.statusText}`);
                    }

                    console.log(`Machine failure event sent to ${targetUrl}`);
                } catch (error: unknown) {
                    console.error(`Failed to handle machine failure for ${targetUrl}:`, (error as Error).message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`Machine failure events processed for ${failureNotificationConfig.machineFailureUrls.length} applications`);
        } catch (error: unknown) {
            console.error('Error handling machine failures:', (error as Error).message);
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
                    const response = await fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(failureEvent)
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send truck failure: ${response.statusText}`);
                    }

                    console.log(`Truck failure event sent to ${targetUrl}`);
                } catch (error: unknown) {
                    console.error(`Failed to handle truck failure for ${targetUrl}:`, (error as Error).message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`Truck failure events processed for ${failureNotificationConfig.truckFailureUrls.length} applications`);
        } catch (error: unknown) {
            console.error('Error handling truck failures:', (error as Error).message);
        }
    }
} 