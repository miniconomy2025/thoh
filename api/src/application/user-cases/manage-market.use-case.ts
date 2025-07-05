import { IMarketRepository } from '../ports/repository.ports';
import { RawMaterialType } from '../../domain/market/market.types';

export class ManageMarketUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async updateMaterialPrice(marketId: number, materialType: RawMaterialType, newPrice: number): Promise<void> {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(marketId);
        if (!rawMaterialsMarket) throw new Error('Raw materials market not found');
        rawMaterialsMarket.updateMaterialPrice(materialType, newPrice);
        await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
    }
}
