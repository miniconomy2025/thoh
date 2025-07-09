import { IMarketRepository } from '../ports/repository.ports';
import { RawMaterialType } from '../../domain/market/market.types';

export class ManageMarketUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async updateMaterialPrice(materialType: RawMaterialType, newPrice: number): Promise<void> {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        if (!rawMaterialsMarket) throw new Error('Raw materials market not found');
        rawMaterialsMarket.updateMaterialPrice(Number(materialType), newPrice);
        await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
    }
}
