import { IMarketRepository } from '../ports/repository.ports';

export class GetMarketStateUseCase {
  constructor(private readonly marketRepo: IMarketRepository) {}
  async execute() {
    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
    const machinesMarket = await this.marketRepo.findMachinesMarket();
            const trucksMarket = await this.marketRepo.findTrucksMarket();
        if (!rawMaterialsMarket || !machinesMarket || !trucksMarket) throw new Error('Market not found');
    return {
      rawMaterialsMarket,
      machinesMarket,
              trucksMarket
    };
  }
} 