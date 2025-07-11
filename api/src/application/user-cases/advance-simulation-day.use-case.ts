import { ExternalsService } from '../../services/external-endpoints';
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
import { RecyclePhonesUseCase } from './recycle-phones.use-case';
import { ReceivePhoneUseCase } from './recieve-phone-use-case';
import { BuyPhoneUseCase } from './buy-phone-use-case';

export class AdvanceSimulationDayUseCase {
  externalsService: ExternalsService;
  recyclePhonesUseCase: RecyclePhonesUseCase;
  private handlePeriodicFailuresUseCase: HandlePeriodicFailuresUseCase;
  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository,
    private readonly breakPhonesUseCase: BreakPhonesUseCase,
    private readonly buyPhoneUseCase: BuyPhoneUseCase
  ) {
    this.externalsService = new ExternalsService();
    this.recyclePhonesUseCase = new RecyclePhonesUseCase();
    this.handlePeriodicFailuresUseCase = new HandlePeriodicFailuresUseCase(marketRepo);}

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
        try {
          const grouped = await this.recyclePhonesUseCase.listGroupedByModel();
          if (grouped.length > 0) {
            await this.externalsService.notifyRecyclers();
          }
          else{
            // Don't notify recyclers if no phones to recycle
          }
          } catch (err) {
            // Do nothing here, we don't want the whole simulation to stop or fail if this endpoint fails
            }
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

        // Simulate someone randomly buying a phone
        await this.buyPhoneUseCase.execute();

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
