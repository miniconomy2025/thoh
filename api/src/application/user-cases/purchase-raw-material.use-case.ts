import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';

export interface PurchaseRawMaterialInput {
    materialName: string;
    weightQuantity: number;
    simulationDate?: Date;
}

export class PurchaseRawMaterialUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute(input: PurchaseRawMaterialInput) {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        if (!rawMaterialsMarket) {
            throw new Error('Raw materials market not found');
        }

        try {
            const result = await rawMaterialsMarket.checkRawMaterialAvailability(input.materialName, input.weightQuantity);
            
            const pricePerKg = result.amount / input.weightQuantity;
            
            const order = new Order(
                input.materialName,
                input.weightQuantity,
                pricePerKg,
                result.amount,
                result.currency,
                'pending', // Start with pending status
                result.materialId // Add the raw material ID
            );
            
            if (input.simulationDate) {
                console.log(`[DEBUG] Setting order date to simulation date: ${input.simulationDate}`);
                order.orderDate = input.simulationDate;
            } else {
                console.log(`[DEBUG] No simulation date provided, using system date: ${new Date()}`);
            }
            
            const savedOrder = await this.marketRepo.saveOrder(order);
            
            return {
                orderId: savedOrder.id,
                materialName: input.materialName,
                weightQuantity: input.weightQuantity,
                price: result.amount,
                bankAccount: "TREASURY_ACCOUNT"
            };
        } catch (error) {
            throw new Error(`Failed to purchase raw material: ${error}`);
        }
    }
} 