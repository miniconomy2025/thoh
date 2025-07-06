import { IMarketRepository } from '../ports/repository.ports';

export class GetMachinesUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute() {
        const machinesMarket = await this.marketRepo.findMachinesMarket();
        if (!machinesMarket) {
            throw new Error('Machines market not found');
        }

        const machines = machinesMarket.getMachinesForSale();
        
        if (machines.length === 0) {
            return { machines: [] };
        }

        const machineGroups = new Map<string, any[]>();
        
        machines.forEach(machine => {
            const machineName = machine.machineName;
            if (!machineGroups.has(machineName)) {
                machineGroups.set(machineName, []);
            }
            machineGroups.get(machineName)!.push(machine);
        });

        const machinesResponse = Array.from(machineGroups.entries()).map(([machineName, machineList]) => {
            const totalQuantity = machineList.reduce((sum, machine) => sum + machine.quantity, 0);
            
            const materialRatio = machineList[0].materialRatio;
            
            const totalProductionRate = machineList.reduce((sum, machine) => sum + machine.productionRate, 0);
            const averageProductionRate = Math.round(totalProductionRate / machineList.length);

            return {
                machineName: machineName,
                quantity: totalQuantity,
                materialRatio: materialRatio,
                productionRate: averageProductionRate
            };
        });

        return { machines: machinesResponse };
    }
} 