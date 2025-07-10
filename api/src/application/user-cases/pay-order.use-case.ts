import { IMarketRepository } from '../ports/repository.ports';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';
import { Order } from '../../domain/market/order.entity';

export interface PayOrderInput {
    orderId: number;
}

export class PayOrderUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository,
        private readonly itemTypeRepo = new ItemTypeRepository()
    ) {}

    async execute(input: PayOrderInput) {
        const order = await this.marketRepo.findOrderById(input.orderId);
        if (!order) {
            throw new Error(`Order with ID ${input.orderId} not found`);
        }

        if (order.status === 'completed') {
            throw new Error(`Order ${input.orderId} is already completed`);
        }

        if (order.status === 'cancelled') {
            throw new Error(`Order ${input.orderId} is cancelled and cannot be paid`);
        }

        const fulfillmentResult = await this.checkAndUpdateMarketInventory(order);
        
        if (!fulfillmentResult.canFulfill) {
            return {
                orderId: order.id,
                itemName: order.itemName,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                status: 'pending',
                message: `Order ${input.orderId} cannot be fulfilled: ${fulfillmentResult.reason}`,
                canFulfill: false,
                availableQuantity: fulfillmentResult.availableQuantity
            };
        }

        const updatedOrder = await this.marketRepo.saveOrder(order);

        const itemId = fulfillmentResult.itemIds && fulfillmentResult.itemIds.length > 0 ? fulfillmentResult.itemIds[0] : (order.itemId ?? 0);
        
        const collection = {
            orderId: order.id,
            itemName: order.itemName,
            itemId: itemId,
            quantity: order.quantity,
            amountCollected: 0,
            orderDate: order.orderDate,
            collected: false,
            id: 0 // or undefined if optional
        };
        
        await this.marketRepo.saveCollection(collection);

        return {
            orderId: updatedOrder.id,
            itemName: updatedOrder.itemName,
            quantity: updatedOrder.quantity,
            totalPrice: updatedOrder.totalPrice,
            status: updatedOrder.status,
            message: `Order ${input.orderId} has been paid and fulfilled successfully. ${updatedOrder.quantity} ${updatedOrder.itemName}(s) marked as sold in database.`,
            canFulfill: true
        };
    }

    private async checkAndUpdateMarketInventory(order: Order): Promise<{ canFulfill: boolean; reason?: string; availableQuantity?: number; itemIds?: number[] }> {
        const itemId = order.itemId ?? 0;
        const quantity = order.quantity;

        // Get item type name from item_type_id
        let itemTypeName: string | null = null;
        if (order.item_type_id) {
            const itemTypeResult = await this.itemTypeRepo.findById(order.item_type_id);
            if (itemTypeResult) {
                itemTypeName = itemTypeResult.name;
            }
        }
        if (itemTypeName === 'truck') {
            try {
                const truckIds = await this.marketRepo.markTrucksAsSold(itemId, quantity);
                return { canFulfill: true, itemIds: truckIds };
            } catch (error: any) {
                const availableMatch = error.message.match(/Available: (\d+)/);
                const availableQuantity = availableMatch ? parseInt(availableMatch[1]) : undefined;
                return { 
                    canFulfill: false, 
                    reason: error.message,
                    availableQuantity
                };
            }
        } else if (itemTypeName === 'machine') {
            try {
                const machineIds = await this.marketRepo.markMachinesAsSold(itemId, quantity);
                return { canFulfill: true, itemIds: machineIds };
            } catch (error: any) {
                const availableMatch = error.message.match(/Available: (\d+)/);
                const availableQuantity = availableMatch ? parseInt(availableMatch[1]) : undefined;
                return { 
                    canFulfill: false, 
                    reason: error.message,
                    availableQuantity
                };
            }
        } else {
            try {
                const materialId = await this.marketRepo.reduceRawMaterialWeight(order.itemName, quantity);
                return { canFulfill: true, itemIds: [materialId] };
            } catch (error: any) {
                return { 
                    canFulfill: false, 
                    reason: error.message
                };
            }
        }
    }
} 