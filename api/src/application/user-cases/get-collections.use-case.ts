import { Collection } from '../../domain/market/collection.entity';
import { IMarketRepository } from '../ports/repository.ports';

export class GetCollectionsUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute() {
        const collections = await this.marketRepo.getAllCollections();
        return collections.map((c: Collection) => ({
            ...c,
            quantity: c.quantity !== undefined ? Number(c.quantity) : c.quantity,
            amountCollected: c.amountCollected !== undefined ? Number(c.amountCollected) : c.amountCollected,
        }));
    }
} 