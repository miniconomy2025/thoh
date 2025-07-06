import { Order } from '../../../domain/market/order.entity';
import { pool } from './client';

export class PgOrderRepository {
    async saveOrder(order: Order): Promise<Order> {
        const result = await pool.query(`
            INSERT INTO orders (orderType, itemName, quantity, unitPrice, totalPrice, currency, orderDate, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            order.orderType,
            order.itemName,
            order.quantity,
            order.unitPrice,
            order.totalPrice,
            order.currency,
            order.orderDate,
            order.status
        ]);

        const savedOrder = result.rows[0];
        return new Order(
            savedOrder.orderType,
            savedOrder.itemName,
            Number(savedOrder.quantity),
            Number(savedOrder.unitPrice),
            Number(savedOrder.totalPrice),
            savedOrder.currency,
            savedOrder.status
        );
    }

    async findOrderById(orderId: number): Promise<Order | null> {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (result.rows.length === 0) return null;

        const orderData = result.rows[0];
        return new Order(
            orderData.orderType,
            orderData.itemName,
            Number(orderData.quantity),
            Number(orderData.unitPrice),
            Number(orderData.totalPrice),
            orderData.currency,
            orderData.status
        );
    }

    async getAllOrders(): Promise<Order[]> {
        const result = await pool.query('SELECT * FROM orders ORDER BY orderDate DESC');
        return result.rows.map(orderData => new Order(
            orderData.orderType,
            orderData.itemName,
            Number(orderData.quantity),
            Number(orderData.unitPrice),
            Number(orderData.totalPrice),
            orderData.currency,
            orderData.status
        ));
    }
} 