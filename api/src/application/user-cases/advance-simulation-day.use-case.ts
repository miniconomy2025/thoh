import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';
import { HandlePeriodicFailuresUseCase } from './handle-periodic-failures.use-case';

// export class AdvanceSimulationDayUseCase {
//     //private handlePeriodicFailuresUseCase: HandlePeriodicFailuresUseCase;

//     constructor(
//         private readonly simulationRepo: ISimulationRepository,
//         private readonly marketRepo: IMarketRepository
//     ) {
//         this.handlePeriodicFailuresUseCase = new HandlePeriodicFailuresUseCase(marketRepo);
import { BreakPhonesUseCase } from './break-phones.use-case';

export class AdvanceSimulationDayUseCase {
  private handlePeriodicFailuresUseCase: HandlePeriodicFailuresUseCase;
  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository,
    private readonly breakPhonesUseCase: BreakPhonesUseCase
  ) {this.handlePeriodicFailuresUseCase = new HandlePeriodicFailuresUseCase(marketRepo);}

  // public async execute(simulationId: number) {
  //   const simulation = await this.simulationRepo.findById(simulationId);
  //   const rawMaterialsMarket = await this.marketRepo.findLatestRawMaterialsMarket();
  //   const machinesMarket = await this.marketRepo.findLatestMachinesMarket();
  //   const trucksMarket = await this.marketRepo.findLatestTrucksMarket();
    
  //   if (!simulation || !rawMaterialsMarket || !machinesMarket || !trucksMarket) {
  //     throw new Error('Simulation or market not found');
  //   }

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
        await this.breakPhonesUseCase.execute();
    }
} 
//     await this.simulationRepo.save(simulation);
//     await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
//     await this.marketRepo.saveMachinesMarket(machinesMarket);
//     await this.marketRepo.saveTrucksMarket(trucksMarket);

//     // Break 10 phones per day
//     //await this.breakPhonesUseCase.execute();
//   }
// } 
