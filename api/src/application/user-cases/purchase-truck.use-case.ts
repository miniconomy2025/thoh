import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';
import { VehicleStatic } from '../../domain/market/vehicle-static.entity';

export interface PurchaseTruckInput {
    truckName: string;
    quantity: number;
    simulationDate?: Date;
}

export class PurchaseTruckUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository, 
        private readonly vehicleStaticRepo = new VehicleStaticRepository(),
        private readonly itemTypeRepo = new ItemTypeRepository()
    ) {}

    async execute(input: PurchaseTruckInput) {
        const trucksMarket = await this.marketRepo.findTrucksMarket();
        if (!trucksMarket) {
            throw new Error('Trucks market not found');
        }

        const trucks = trucksMarket.getTrucksForSale();
        const staticTrucks = await this.vehicleStaticRepo.findAll();

        // Find the static truck by name
        const staticTruck = staticTrucks.find((st: VehicleStatic) => st.name === input.truckName);
        if (!staticTruck) {
            throw new Error(`Truck '${input.truckName}' not found in static table`);
        }
        // Find the truck instance by staticId
        const truck = trucks.find(t => t.vehicleStaticId === staticTruck.id);
        if (!truck) {
            throw new Error(`Truck '${input.truckName}' not found in market`);
        }

        const totalPrice = truck.cost.amount * input.quantity;
        
        const order = new Order();
        order.itemName = staticTruck.name;
        order.quantity = input.quantity;
        order.unitPrice = truck.cost.amount;
        order.totalPrice = totalPrice;
        order.currency = truck.cost.currency;
        order.status = 'pending';
        order.itemId = truck.vehicleStaticId;
        order.marketId = 2;
        order.item_type_id = await this.itemTypeRepo.findTruckTypeId();
        if (input.simulationDate) {
            order.orderDate = input.simulationDate;
        }
        const savedOrder = await this.marketRepo.saveOrder(order);

        return {
            orderId: savedOrder.id,
            truckName: staticTruck.name,
            totalPrice: totalPrice,
            unitWeight: truck.weight.value,
            totalWeight: truck.weight.value * input.quantity,
            quantity: input.quantity,
            maximumLoad: truck.weight.value * 2,
            operatingCostPerDay: `${truck.operatingCostPerDay.amount}/day`,
            bankAccount: "000000000000"
        };
    }
} 