import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';
import { MaterialStaticRepository } from '../../infrastructure/persistence/postgres/material-static.repository';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';
import { MaterialStatic } from '../../domain/market/material-static.entity';

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
        const staticMaterial = staticMaterials.find((sm: MaterialStatic) => sm.name === input.materialName);
        if (!staticMaterial) {
            throw new Error(`Material '${input.materialName}' not found in static table`);
        }
        const materialStaticId = staticMaterial.id;

        try {
            const result = await rawMaterialsMarket.checkRawMaterialAvailability(materialStaticId, input.weightQuantity);
            
            const pricePerKg = result.amount / input.weightQuantity;
            
            const order = new Order();
            order.itemName = staticMaterial.name;
            order.quantity = input.weightQuantity;
            order.unitPrice = pricePerKg;
            order.totalPrice = result.amount;
            order.currency = result.currency;
            order.status = 'pending';
            order.itemId = result.materialId;
            order.marketId = 3;
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
                bankAccount: "000000000000"
            };
        } catch (error) {
            throw new Error(`Failed to purchase raw material: ${error}`);
        }
    }
} 