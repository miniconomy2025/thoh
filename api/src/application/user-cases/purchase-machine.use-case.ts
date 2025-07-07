import { IMarketRepository } from '../ports/repository.ports';
import { Order } from '../../domain/market/order.entity';

export interface PurchaseMachineInput {
    machineName: string;
    quantity: number;
    simulationDate?: Date;
}

export class PurchaseMachineUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute(input: PurchaseMachineInput) {
        const machinesMarket = await this.marketRepo.findMachinesMarket();
        if (!machinesMarket) {
            throw new Error('Machines market not found');
        }

        const machines = machinesMarket.getMachinesForSale();
        const machine = machines.find(m => m.machineName === input.machineName);
        
        if (!machine) {
            throw new Error(`Machine '${input.machineName}' not found`);
        }

        const totalPrice = machine.cost.amount * input.quantity;
        
        const order = new Order(
            machine.machineName,
            input.quantity,
            machine.cost.amount,
            totalPrice,
            machine.cost.currency,
            'pending', // Start with pending status
            machine.id // Add the machine ID
        );
        
        // Set the order date to simulation date if provided
        if (input.simulationDate) {
            order.orderDate = input.simulationDate;
        }
        
        const savedOrder = await this.marketRepo.saveOrder(order);

        return {
            orderId: savedOrder.id,
            machineName: machine.machineName,
            quantity: input.quantity,
            totalPrice: totalPrice,
            unitPrice: machine.cost.amount,
            unitWeight: machine.weight.value,
            weight: machine.weight.value * input.quantity,
            machineDetails: {
                materialRatio: machine.materialRatio,
                materialRatioDescription: machine.materialRatioDescription,
                productionRate: machine.productionRate
            }
        };
    }
} 