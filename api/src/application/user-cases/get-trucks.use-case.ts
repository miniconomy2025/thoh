import { IMarketRepository } from '../ports/repository.ports';
import { VehicleStatic } from '../../domain/market/vehicle-static.entity';
import { VehicleStaticRepository } from '../../infrastructure/persistence/postgres/vehicle-static.repository';
import { Truck } from '../../domain/market/equipment.entity';

interface TruckWithStaticData {
    truck: Truck;
    staticData: VehicleStatic;
}

export class GetTrucksUseCase {
    constructor(private readonly marketRepo: IMarketRepository, private readonly vehicleStaticRepo = new VehicleStaticRepository()) {}

    async execute() {
        const trucksMarket = await this.marketRepo.findTrucksMarket();
        if (!trucksMarket) {
            throw new Error('Trucks market not found');
        }

        const trucks = trucksMarket.getTrucksForSale();
        
        if (trucks.length === 0) {
            return [];
        }

        // Fetch all static vehicle data from the DB
        const staticVehicles = await this.vehicleStaticRepo.findAll();
        const staticLookup = new Map(staticVehicles.map((sv: VehicleStatic) => [sv.id, sv]));

        const truckGroups = new Map<string, TruckWithStaticData[]>();
        
        trucks.forEach(truck => {
            const staticData = staticLookup.get(truck.vehicleStaticId);
            if (!staticData) return; // Skip if no static data found
            
            const truckName = staticData.name || `truck_${truck.vehicleStaticId}`;
            if (!truckGroups.has(truckName)) {
                truckGroups.set(truckName, []);
            }
            truckGroups.get(truckName)!.push({ truck, staticData });
        });

        const trucksResponse = Array.from(truckGroups.entries()).map(([truckName, truckList]) => {
            const totalPrice = truckList.reduce((sum, item) => sum + item.truck.cost.amount, 0);
            const averagePrice = totalPrice / truckList.length;
            const totalQuantity = truckList.reduce((sum, item) => sum + item.truck.quantity, 0);
            
            const totalOperatingCost = truckList.reduce((sum, item) => sum + item.truck.operatingCostPerDay.amount, 0);
            const averageOperatingCost = totalOperatingCost / truckList.length;
            
            const totalMaximumLoad = truckList.reduce((sum, item) => sum + item.truck.weight.value * 2, 0);
            const averageMaximumLoad = totalMaximumLoad / truckList.length;

            return {
                truckName: truckName,
                description: truckList[0].staticData.description,
                price: Math.round(averagePrice * 100) / 100,
                quantity: totalQuantity,
                operatingCost: Math.round(averageOperatingCost * 100) / 100,
                maximumLoad: Math.round(averageMaximumLoad * 100) / 100
            };
        });

        return trucksResponse;
    }
} 