import { IMarketRepository } from '../ports/repository.ports';

export class GetOrdersUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute() {
        const orders = await this.marketRepo.getAllOrders();
        
        return orders.map(order => ({
            orderId: order.id,
            itemName: order.itemName,
            quantity: order.quantity,
            unitPrice: order.unitPrice,
            totalPrice: order.totalPrice,
            currency: order.currency,
            orderDate: order.orderDate,
            status: order.status
        }));
    }
} 