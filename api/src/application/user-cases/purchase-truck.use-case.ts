import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';

export interface PurchaseTruckInput {
    truckName: string;
    quantity: number;
    simulationDate?: Date;
}

export class PurchaseTruckUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute(input: PurchaseTruckInput) {
        const trucksMarket = await this.marketRepo.findTrucksMarket();
        if (!trucksMarket) {
            throw new Error('Trucks market not found');
        }

        const trucks = trucksMarket.getTrucksForSale();
        const truck = trucks.find(t => t.type === input.truckName);
        
        if (!truck) {
            throw new Error(`Truck '${input.truckName}' not found`);
        }

        const totalPrice = truck.cost.amount * input.quantity;
        
        const order = new Order(
            truck.type,
            input.quantity,
            truck.cost.amount,
            totalPrice,
            truck.cost.currency,
            'pending', // Start with pending status
            truck.id // Add the truck ID
        );
        
        if (input.simulationDate) {
            order.orderDate = input.simulationDate;
        }
        
        const savedOrder = await this.marketRepo.saveOrder(order);

        return {
            orderId: savedOrder.id,
            truckName: truck.type,
            price: totalPrice,
            maximumLoad: truck.weight.value,
            operatingCostPerDay: `${truck.operatingCostPerDay.amount}/day`
        };
    }
} 