import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';
import { BreakPhonesUseCase } from './break-phones.use-case';

export class AdvanceSimulationDayUseCase {
  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository,
    private readonly breakPhonesUseCase: BreakPhonesUseCase
  ) {}

  public async execute(simulationId: number) {
    const simulation = await this.simulationRepo.findById(simulationId);
    const rawMaterialsMarket = await this.marketRepo.findLatestRawMaterialsMarket();
    const machinesMarket = await this.marketRepo.findLatestMachinesMarket();
    const trucksMarket = await this.marketRepo.findLatestTrucksMarket();
    
    if (!simulation || !rawMaterialsMarket || !machinesMarket || !trucksMarket) {
      throw new Error('Simulation or market not found');
    }

    simulation.advanceDay();
    rawMaterialsMarket.applyDailyRandomness();
    machinesMarket.applyDailyRandomness();
    trucksMarket.applyDailyRandomness();

    await this.simulationRepo.save(simulation);
    await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
    await this.marketRepo.saveMachinesMarket(machinesMarket);
    await this.marketRepo.saveTrucksMarket(trucksMarket);

    // Break 10 phones per day
    await this.breakPhonesUseCase.execute();
  }
} 