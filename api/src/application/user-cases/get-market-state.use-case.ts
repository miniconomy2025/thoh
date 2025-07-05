import { IMarketRepository } from '../ports/repository.ports';

export class GetMarketStateUseCase {
  constructor(private readonly marketRepo: IMarketRepository) {}
  async execute(marketId: number) {
    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(marketId);
    const machinesMarket = await this.marketRepo.findMachinesMarket(marketId);
    const vehiclesMarket = await this.marketRepo.findVehiclesMarket(marketId);
    if (!rawMaterialsMarket || !machinesMarket || !vehiclesMarket) throw new Error('Market not found');
    return {
      rawMaterialsMarket,
      machinesMarket,
      vehiclesMarket
    };
  }
} 