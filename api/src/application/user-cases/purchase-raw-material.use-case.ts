import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';
import { MaterialStaticRepository } from '../../infrastructure/persistence/postgres/material-static.repository';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';

export interface PurchaseRawMaterialInput {
    materialName: string;
    weightQuantity: number;
    simulationDate?: Date;
}

export class PurchaseRawMaterialUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository, 
        private readonly materialStaticRepo = new MaterialStaticRepository(),
        private readonly itemTypeRepo = new ItemTypeRepository()
    ) {}

    async execute(input: PurchaseRawMaterialInput) {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        if (!rawMaterialsMarket) {
            throw new Error('Raw materials market not found');
        }

        // Look up the static ID for the material name
        const staticMaterials = await this.materialStaticRepo.findAll();
        const staticMaterial = staticMaterials.find((sm: any) => sm.name === input.materialName);
        if (!staticMaterial) {
            throw new Error(`Material '${input.materialName}' not found in static table`);
        }
        const materialStaticId = staticMaterial.id;

        try {
            const result = await rawMaterialsMarket.checkRawMaterialAvailability(materialStaticId, input.weightQuantity);
            
            const pricePerKg = result.amount / input.weightQuantity;
            
            const order = new Order(
                staticMaterial.name,
                input.weightQuantity,
                pricePerKg,
                result.amount,
                result.currency,
                'pending', // Start with pending status
                result.materialId, // Add the raw material ID
                3 // Raw materials market ID
            );
            order.item_type_id = await this.itemTypeRepo.findRawMaterialTypeId();
            
            if (input.simulationDate) {
                order.orderDate = input.simulationDate;
            } 
            
            const savedOrder = await this.marketRepo.saveOrder(order);
            
            return {
                orderId: savedOrder.id,
                materialName: staticMaterial.name,
                weightQuantity: input.weightQuantity,
                price: result.amount,
                bankAccount: "TREASURY_ACCOUNT"
            };
        } catch (error) {
            throw new Error(`Failed to purchase raw material: ${error}`);
        }
    }
} 