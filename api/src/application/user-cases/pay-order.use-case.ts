import { IMarketRepository } from '../ports/repository.ports';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';
import { Order } from '../../domain/market/order.entity';
import { ExternalsService } from '../../services/external-endpoints';
import RetryQueueService from '../../services/retry-queue.service';

export interface PayOrderInput {
    orderId: number;
    companyName: string;
}

export class PayOrderUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository,
        private readonly itemTypeRepo = new ItemTypeRepository(),
        private readonly externalsService = new ExternalsService()
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
                totalPrice: Number(order.totalPrice),
                status: 'pending',
                message: `Order ${input.orderId} cannot be fulfilled: ${fulfillmentResult.reason}`,
                canFulfill: false,
                availableQuantity: fulfillmentResult.availableQuantity
            };
        }

        const updatedOrder = await this.marketRepo.saveOrder(order);

        const itemId = fulfillmentResult.itemIds && fulfillmentResult.itemIds.length > 0 ? fulfillmentResult.itemIds[0] : (order.itemId ?? 0);

        const itemTypeResult = order.item_type_id ? await this.itemTypeRepo.findById(order.item_type_id) : null;

        if (itemTypeResult && itemTypeResult.name === 'machine' && order.itemName === 'recycling_machine') {
            const machine = await this.marketRepo.findMachineById(itemId);
            let totalWeight = null;
            if (machine) {
                totalWeight = Number(machine.weight) * Number(updatedOrder.quantity);
            }
            try {
                await this.externalsService.notifyRecyclersMachineData(JSON.stringify({
                    orderId: updatedOrder.id,
                    totalWeight
                }));
            } catch (notifyErr) {
                console.error('Failed to notify recycling machine API:', notifyErr);
                RetryQueueService.enqueue({
                  type: 'recycler',
                  payload: JSON.stringify({
                    orderId: updatedOrder.id,
                    totalWeight
                  }),
                  attempt: 1,
                  maxAttempts: 5,
                  notifyFn: this.externalsService.notifyRecyclersMachineData.bind(this.externalsService)
                });
            }
        }

        let truckFields = {};
        if (itemTypeResult && itemTypeResult.name === 'truck') {
            const truck = await this.marketRepo.findTruckById(itemId);
            if (truck) {
                truckFields = {
                    truckName: truck.name || order.itemName,
                    unitWeight: Number(truck.weight),
                    totalWeight: Number(truck.weight) * Number(updatedOrder.quantity),
                    maximumLoad: Number(truck.weight) * 2,
                    operatingCostPerDay: Number(truck.operatingCostPerDay),
                };

                const truckPayload = {
                    orderId: updatedOrder.id,
                    truckName: truck.name || order.itemName,
                    totalPrice: Number(updatedOrder.totalPrice),
                    unitWeight: Number(truck.weight),
                    totalWeight: Number(truck.weight) * Number(updatedOrder.quantity),
                    quantity: Number(updatedOrder.quantity),
                    maximumLoad: Number(truck.weight) * 2,
                    operatingCostPerDay: Number(truck.operatingCostPerDay),
                };
                try {
                    if (input.companyName === "bulk_logistics") {
                        await this.externalsService.notifyBulkLogistics(truckPayload);
   
                    } else if (input.companyName === "consumer_logistics") {

                        await this.externalsService.notifyConsumerLogistics(truckPayload);
  
                    }
                } catch (notifyErr) {
                    console.error('Failed to notify truck delivery API:', notifyErr);
                    if (input.companyName === "bulk_logistics") {
                      RetryQueueService.enqueue({
                        type: 'bulk_logistics',
                        payload: truckPayload,
                        attempt: 1,
                        maxAttempts: 5,
                        notifyFn: this.externalsService.notifyBulkLogistics.bind(this.externalsService)
                      });
                    } else if (input.companyName === "consumer_logistics") {
                      RetryQueueService.enqueue({
                        type: 'consumer_logistics',
                        payload: truckPayload,
                        attempt: 1,
                        maxAttempts: 5,
                        notifyFn: this.externalsService.notifyConsumerLogistics.bind(this.externalsService)
                      });
                    }
                }
            }
        }

        const collection = {
            orderId: order.id,
            itemName: order.itemName,
            itemId: itemId,
            quantity: order.quantity,
            amountCollected: 0,
            orderDate: order.orderDate,
            collected: false,
            id: 0 
        };
        
        await this.marketRepo.saveCollection(collection);

        return {
            orderId: updatedOrder.id,
            itemName: updatedOrder.itemName,
            quantity: updatedOrder.quantity,
            totalPrice: Number(updatedOrder.totalPrice),
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