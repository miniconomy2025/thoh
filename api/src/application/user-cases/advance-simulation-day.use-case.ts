import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';
import { HandlePeriodicFailuresUseCase } from './handle-periodic-failures.use-case';

export class AdvanceSimulationDayUseCase {
    private handlePeriodicFailuresUseCase: HandlePeriodicFailuresUseCase;

    constructor(
        private readonly simulationRepo: ISimulationRepository,
        private readonly marketRepo: IMarketRepository
    ) {
        this.handlePeriodicFailuresUseCase = new HandlePeriodicFailuresUseCase(marketRepo);
    }

    public async execute(simulationId: number): Promise<void> {
        const simulation = await this.simulationRepo.findById(simulationId);
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        const machinesMarket = await this.marketRepo.findMachinesMarket();
        const trucksMarket = await this.marketRepo.findTrucksMarket();
        
        if (!simulation || !rawMaterialsMarket || !machinesMarket || !trucksMarket) {
            throw new Error('Simulation or market not found');
        }

        // Advance the day
        simulation.advanceDay();
        rawMaterialsMarket.applyDailyRandomness();
        machinesMarket.applyDailyRandomness();
        trucksMarket.applyDailyRandomness();

        // Handle periodic failures
        await this.handlePeriodicFailuresUseCase.execute(simulation);

        // Save all changes
        await this.simulationRepo.save(simulation);
        await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
        await this.marketRepo.saveMachinesMarket(machinesMarket);
        await this.marketRepo.saveTrucksMarket(trucksMarket);
    }
} 