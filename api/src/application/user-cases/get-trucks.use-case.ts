import { IMarketRepository } from '../ports/repository.ports';

export class GetTrucksUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute() {
        const trucksMarket = await this.marketRepo.findTrucksMarket();
        if (!trucksMarket) {
            throw new Error('Trucks market not found');
        }

        const trucks = trucksMarket.getTrucksForSale();
        
        if (trucks.length === 0) {
            return [];
        }

        const truckGroups = new Map<string, any[]>();
        
        trucks.forEach(truck => {
            const truckName = truck.truckName;
            if (!truckGroups.has(truckName)) {
                truckGroups.set(truckName, []);
            }
            truckGroups.get(truckName)!.push(truck);
        });

        const trucksResponse = Array.from(truckGroups.entries()).map(([truckName, truckList]) => {
            const totalPrice = truckList.reduce((sum, truck) => sum + truck.cost.amount, 0);
            const averagePrice = totalPrice / truckList.length;
            const totalQuantity = truckList.reduce((sum, truck) => sum + truck.quantity, 0);
            
            const totalOperatingCost = truckList.reduce((sum, truck) => sum + truck.operatingCostPerDay.amount, 0);
            const averageOperatingCost = totalOperatingCost / truckList.length;
            
            const totalMaximumLoad = truckList.reduce((sum, truck) => sum + truck.maximumLoad, 0);
            const averageMaximumLoad = totalMaximumLoad / truckList.length;

            return {
                truckName: truckName,
                price: Math.round(averagePrice * 100) / 100,
                quantity: totalQuantity,
                operatingCost: Math.round(averageOperatingCost * 100) / 100,
                maximumLoad: Math.round(averageMaximumLoad * 100) / 100
            };
        });

        return trucksResponse;
    }
} 