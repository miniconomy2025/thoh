import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';
import { MachineStaticRepository } from '../../infrastructure/persistence/postgres/machine-static.repository';
import { ItemTypeRepository } from '../../infrastructure/persistence/postgres/item-type.repository';
import { MachineStatic } from '../../domain/market/machine-static.entity';

export interface PurchaseMachineInput {
    machineName: string;
    quantity: number;
    simulationDate?: Date;
}

export class PurchaseMachineUseCase {
    constructor(
        private readonly marketRepo: IMarketRepository, 
        private readonly machineStaticRepo = new MachineStaticRepository(),
        private readonly itemTypeRepo = new ItemTypeRepository()
    ) {}

    async execute(input: PurchaseMachineInput) {
        const machinesMarket = await this.marketRepo.findMachinesMarket();
        if (!machinesMarket) {
            throw new Error('Machines market not found');
        }

        const machines = machinesMarket.getMachinesForSale();
        const staticMachines = await this.machineStaticRepo.findAll();
        const staticLookup = new Map(staticMachines.map((sm: MachineStatic) => [sm.id, sm]));

        // Find the static machine by name
        const staticMachine = staticMachines.find((sm: MachineStatic) => sm.name === input.machineName);
        if (!staticMachine) {
            throw new Error(`Machine '${input.machineName}' not found in static table`);
        }
        // Find the machine instance by staticId
        const machine = machines.find(m => m.machineStaticId === staticMachine.id);
        if (!machine) {
            throw new Error(`Machine '${input.machineName}' not found in market`);
        }

        const totalPrice = machine.cost.amount * input.quantity;
        
        const order = new Order(
            staticMachine.name,
            input.quantity,
            machine.cost.amount,
            totalPrice,
            machine.cost.currency,
            'pending', // Start with pending status
            machine.machineStaticId, // Use static ID instead of market ID
            1 // Machine market ID
        );
        order.item_type_id = await this.itemTypeRepo.findMachineTypeId();
        
        // Set the order date to simulation date if provided
        if (input.simulationDate) {
            order.orderDate = input.simulationDate;
        }
        
        const savedOrder = await this.marketRepo.saveOrder(order);

        return {
            orderId: savedOrder.id,
            machineName: staticMachine.name,
            totalPrice: totalPrice,
            unitWeight: machine.weight.value,
            totalWeight: machine.weight.value * input.quantity,
            quantity: input.quantity,
            machineDetails: {
                requiredMaterials: machine.materialRatio ? Object.keys(machine.materialRatio).join(', ') : 'None',
                inputRatio: machine.materialRatio,
                productionRate: machine.productionRate
            },
            bankAccount: "TREASURY_ACCOUNT"
        };
    }
} 