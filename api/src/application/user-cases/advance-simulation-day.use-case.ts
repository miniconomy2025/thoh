import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';

export class AdvanceSimulationDayUseCase {
  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository
  ) {}

  public async execute(simulationId: number, marketId: number) {
    const simulation = await this.simulationRepo.findById(simulationId);
    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(marketId);
    const machinesMarket = await this.marketRepo.findMachinesMarket(marketId);
    const vehiclesMarket = await this.marketRepo.findVehiclesMarket(marketId);

    if (!simulation || !rawMaterialsMarket || !machinesMarket || !vehiclesMarket) {
      throw new Error('Simulation or market not found');
    }

    simulation.advanceDay();
    rawMaterialsMarket.applyDailyRandomness();
    machinesMarket.applyDailyRandomness();
    vehiclesMarket.applyDailyRandomness();

    await this.simulationRepo.save(simulation);
    await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
    await this.marketRepo.saveMachinesMarket(machinesMarket);
    await this.marketRepo.saveVehiclesMarket(vehiclesMarket);
  }
} 