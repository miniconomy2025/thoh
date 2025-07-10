import { IMarketRepository } from '../ports/repository.ports';
import { MachineStatic } from '../../domain/market/machine-static.entity';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { Machine } from '../../domain/market/equipment.entity';

interface MachineWithStaticData {
    machine: Machine;
    staticData: MachineStatic;
}

export class GetMachinesUseCase {
    constructor(private readonly marketRepo: IMarketRepository, private readonly machineStaticRepo = new MachineStaticRepository()) {}

    async execute() {
        const machinesMarket = await this.marketRepo.findMachinesMarket();
        if (!machinesMarket) {
            throw new Error('Machines market not found');
        }

        const machines = machinesMarket.getMachinesForSale();
        
        if (machines.length === 0) {
            return { machines: [] };
        }

        // Fetch all static machine data from the DB
        const staticMachines = await this.machineStaticRepo.findAll();
        const staticLookup = new Map(staticMachines.map((sm: MachineStatic) => [sm.id, sm]));

        const machineGroups = new Map<string, MachineWithStaticData[]>();
        
        machines.forEach(machine => {
            const staticData = staticLookup.get(machine.machineStaticId);
            if (!staticData) return; // Skip if no static data found
            
            const machineName = staticData.name || `machine_${machine.machineStaticId}`;
            if (!machineGroups.has(machineName)) {
                machineGroups.set(machineName, []);
            }
            machineGroups.get(machineName)!.push({ machine, staticData });
        });

        const machinesResponse = Array.from(machineGroups.entries()).map(([machineName, machineList]) => {
            const totalQuantity = machineList.reduce((sum, item) => sum + item.machine.quantity, 0);
            const materialRatio = machineList[0].machine.materialRatio;
            const totalProductionRate = machineList.reduce((sum, item) => sum + item.machine.productionRate, 0);
            const averageProductionRate = Math.round(totalProductionRate / machineList.length);
            const averagePrice = Math.round(machineList.reduce((sum, item) => sum + item.machine.cost.amount, 0) / machineList.length);

            return {
                machineName: machineName,
                inputs: machineList[0].staticData.description,
                quantity: totalQuantity,
                inputRatio: materialRatio,
                productionRate: averageProductionRate,
                price: averagePrice
            };
        });

        return { machines: machinesResponse };
    }
} 