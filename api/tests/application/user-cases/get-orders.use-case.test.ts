import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetOrdersUseCase } from '../../../src/application/user-cases/get-orders.use-case'
import { Order } from '../../../src/domain/market/order.entity'
import { createOrder } from '../../helpers/test-helpers'

// Mock repository
const mockMarketRepo = {
  getAllOrders: vi.fn()
}

describe('GetOrdersUseCase', () => {
  let useCase: GetOrdersUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetOrdersUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should return empty array when no orders exist', async () => {
      // Arrange
      mockMarketRepo.getAllOrders.mockResolvedValue([])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([])
      expect(mockMarketRepo.getAllOrders).toHaveBeenCalled()
    })

    it('should return formatted orders when orders exist', async () => {
      // Arrange
      const order1 = createOrder({
        id: 1,
        itemName: 'Test Machine',
        itemId: 1,
        quantity: 2,
        unitPrice: 1000.0,
        totalPrice: 2000.0,
        currency: 'ZAR',
        orderDate: new Date('2024-01-01'),
        status: 'pending',
        item_type_id: 1,
        marketId: 1
      })

      const order2 = createOrder({
        id: 2,
        itemName: 'Test Truck',
        itemId: 2,
        quantity: 1,
        unitPrice: 5000.0,
        totalPrice: 5000.0,
        currency: 'ZAR',
        orderDate: new Date('2024-01-02'),
        status: 'completed',
        item_type_id: 2,
        marketId: 2
      })

      mockMarketRepo.getAllOrders.mockResolvedValue([order1, order2])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        orderId: 1,
        itemName: 'Test Machine',
        itemId: 1,
        quantity: 2,
        unitPrice: 1000.0,
        totalPrice: 2000.0,
        currency: 'ZAR',
        orderDate: new Date('2024-01-01'),
        status: 'pending',
        item_type_id: 1,
        marketId: 1
      })
      expect(result[1]).toEqual({
        orderId: 2,
        itemName: 'Test Truck',
        itemId: 2,
        quantity: 1,
        unitPrice: 5000.0,
        totalPrice: 5000.0,
        currency: 'ZAR',
        orderDate: new Date('2024-01-02'),
        status: 'completed',
        item_type_id: 2,
        marketId: 2
      })
    })

    it('should handle single order', async () => {
      // Arrange
      const order = createOrder({
        id: 1,
        itemName: 'Single Item',
        itemId: 1,
        quantity: 1,
        unitPrice: 100.0,
        totalPrice: 100.0,
        currency: 'USD',
        orderDate: new Date('2024-01-01'),
        status: 'pending',
        item_type_id: 1,
        marketId: 1
      })

      mockMarketRepo.getAllOrders.mockResolvedValue([order])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].orderId).toBe(1)
      expect(result[0].itemName).toBe('Single Item')
      expect(result[0].currency).toBe('USD')
    })
  })
})
