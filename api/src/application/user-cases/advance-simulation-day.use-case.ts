import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';

export class AdvanceSimulationDayUseCase {
  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository
  ) {}

  public async execute(simulationId: number) {
    const simulation = await this.simulationRepo.findById(simulationId);
    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
    const machinesMarket = await this.marketRepo.findMachinesMarket();
            const trucksMarket = await this.marketRepo.findTrucksMarket();
        
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
  }
} 