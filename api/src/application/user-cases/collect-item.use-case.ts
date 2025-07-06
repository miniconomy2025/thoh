import { IMarketRepository } from '../ports/repository.ports';

export interface CollectItemInput {
    orderId: number;
}

export class CollectItemUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute(input: CollectItemInput) {
        const collection = await this.marketRepo.findCollectionByOrderId(input.orderId);
        if (!collection) {
            throw new Error(`No collection found for order ${input.orderId}`);
        }

        if (collection.collected) {
            throw new Error(`Order ${input.orderId} has already been collected`);
        }

        await this.marketRepo.markCollectionAsCollected(input.orderId);

        return {
            orderId: input.orderId,
            itemName: collection.itemName,
            quantity: collection.quantity,
            message: `Order ${input.orderId} has been marked as collected successfully`
        };
    }
} 