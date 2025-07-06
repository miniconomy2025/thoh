import { IMarketRepository } from '../ports/repository.ports';

export interface PayOrderInput {
    orderId: number;
}

export class PayOrderUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

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

        order.status = 'completed';
        
        const updatedOrder = await this.marketRepo.saveOrder(order);

        const itemId = fulfillmentResult.itemIds && fulfillmentResult.itemIds.length > 0 ? fulfillmentResult.itemIds[0] : order.itemId;
        
        const collection = {
            orderId: order.id,
            itemName: order.itemName,
            itemId: itemId,
            quantity: order.quantity,
            orderDate: order.orderDate,
            collected: false
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

    private async checkAndUpdateMarketInventory(order: any): Promise<{ canFulfill: boolean; reason?: string; availableQuantity?: number; itemIds?: number[] }> {
        const itemName = order.itemName;
        const quantity = order.quantity;

        if (this.isTruckType(itemName)) {
            try {
                const truckIds = await this.marketRepo.markTrucksAsSold(itemName, quantity);
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
        } else if (this.isMachineType(itemName)) {
            try {
                const machineIds = await this.marketRepo.markMachinesAsSold(itemName, quantity);
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
                const materialId = await this.marketRepo.reduceRawMaterialWeight(itemName, quantity);
                return { canFulfill: true, itemIds: [materialId] };
            } catch (error: any) {
                return { 
                    canFulfill: false, 
                    reason: error.message
                };
            }
        }
    }

    private isTruckType(itemName: string): boolean {
        const truckTypes = ['large_truck', 'medium_truck', 'small_truck'];
        return truckTypes.includes(itemName);
    }

    private isMachineType(itemName: string): boolean {
        const machineTypes = [
            'electronics_machine', 'ephone_machine', 'ephone_plus_machine', 
            'ephone_pro_max_machine', 'cosmos_z25_machine', 'cosmos_z25_ultra_machine', 
            'cosmos_z25_fe_machine', 'case_machine', 'screen_machine', 'recycling_machine'
        ];
        return machineTypes.includes(itemName);
    }
} 