import { IMarketRepository } from '../ports/repository.ports';

export interface CollectItemInput {
    orderId: number;
    collectQuantity: number;
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

        const currentCollected = Number(collection.amountCollected ?? 0);
        const totalQuantity = Number(collection.quantity);
        if(input.collectQuantity > totalQuantity - currentCollected) {
            throw new Error(`Cannot collect ${input.collectQuantity} items. Would exceed total quantity of ${totalQuantity} (already collected: ${currentCollected}).`);
        }
        const toCollect = input.collectQuantity;
        
        const updated = await this.marketRepo.collectFromCollection(input.orderId, toCollect);

        return {
            orderId: input.orderId,
            quantityRemaining: updated.quantity - updated.amountCollected
        };
    }
} 