import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PayOrderUseCase, PayOrderInput } from '../../../src/application/user-cases/pay-order.use-case'
import { Order } from '../../../src/domain/market/order.entity'
import { Machine } from '../../../src/domain/market/equipment.entity'
import { Truck } from '../../../src/domain/market/equipment.entity'
import { createOrder, createMachine, createTruck, createMoney, createWeight } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findOrderById: vi.fn(),
  saveOrder: vi.fn(),
  saveCollection: vi.fn(),
  markTrucksAsSold: vi.fn(),
  markMachinesAsSold: vi.fn(),
  reduceRawMaterialWeight: vi.fn(),
  findMachineById: vi.fn(),
  findTruckById: vi.fn()
}

const mockItemTypeRepo = {
  findById: vi.fn()
}

const mockExternalsService = {
  notifyRecyclersMachineData: vi.fn(),
  notifyBulkLogistics: vi.fn(),
  notifyConsumerLogistics: vi.fn()
}

vi.mock('../../../src/infrastructure/persistence/postgres/item-type.repository', () => ({
  ItemTypeRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn()
  }))
}))

vi.mock('../../../src/services/external-endpoints', () => ({
  ExternalsService: vi.fn().mockImplementation(() => ({
    notifyRecyclersMachineData: vi.fn(),
    notifyBulkLogistics: vi.fn(),
    notifyConsumerLogistics: vi.fn()
  }))
}))

vi.mock('../../../src/services/retry-queue.service', () => ({
  default: {
    enqueue: vi.fn()
  }
}))

describe('PayOrderUseCase', () => {
  let useCase: PayOrderUseCase
  let mockItemTypeRepo: any
  let mockExternalsService: any
  let mockRetryQueueService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked modules
    const { ItemTypeRepository } = await import('../../../src/infrastructure/persistence/postgres/item-type.repository')
    const { ExternalsService } = await import('../../../src/services/external-endpoints')
    const RetryQueueService = await import('../../../src/services/retry-queue.service')
    
    mockItemTypeRepo = new ItemTypeRepository()
    mockExternalsService = new ExternalsService()
    mockRetryQueueService = RetryQueueService.default
    
    Object.values(mockMarketRepo).forEach(mock => mock.mockClear())
    Object.values(mockItemTypeRepo).forEach(mock => mock.mockClear())
    Object.values(mockExternalsService).forEach(mock => mock.mockClear())
    mockRetryQueueService.enqueue.mockClear()
    
    useCase = new PayOrderUseCase(
      mockMarketRepo as any,
      mockItemTypeRepo as any,
      mockExternalsService as any
    )
  })

  describe('execute', () => {
    it('should successfully pay for a raw material order', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Copper',
        quantity: 10,
        totalPrice: 1000.00,
        status: 'pending',
        item_type_id: 1
      })

      const itemType = { id: 1, name: 'raw_material' }
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.reduceRawMaterialWeight.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        totalPrice: 1000.00,
        status: 'completed',
        message: 'Order 1 has been paid and fulfilled successfully. 10 Copper(s) marked as sold in database.',
        canFulfill: true
      })

      expect(mockMarketRepo.reduceRawMaterialWeight).toHaveBeenCalledWith('Copper', 10)
      expect(mockMarketRepo.saveOrder).toHaveBeenCalledWith(order)
      expect(mockMarketRepo.saveCollection).toHaveBeenCalled()
    })

    it('should successfully pay for a machine order and notify recyclers', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        itemName: 'recycling_machine',
        quantity: 2,
        totalPrice: 5000.00,
        status: 'pending',
        item_type_id: 2,
        itemId: 1
      })

      const itemType = { id: 2, name: 'machine' }
      const machine = createMachine({
        id: 1,
        weight: createWeight({ value: 1000 }),
        quantity: 2
      })
      // Mock the weight property to return a number instead of Weight object
      machine.weight = 1000
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.markMachinesAsSold.mockResolvedValue([1, 2])
      mockMarketRepo.findMachineById.mockResolvedValue(machine)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})
      mockExternalsService.notifyRecyclersMachineData.mockResolvedValue({})

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockMarketRepo.markMachinesAsSold).toHaveBeenCalledWith(1, 2)
      expect(mockExternalsService.notifyRecyclersMachineData).toHaveBeenCalledWith(
        JSON.stringify({
          orderId: 1,
          totalWeight: 2000 // 1000 * 2
        })
      )
    })

    it('should successfully pay for a truck order and notify logistics', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'bulk_logistics'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Delivery Truck',
        quantity: 1,
        totalPrice: 10000.00,
        status: 'pending',
        item_type_id: 3,
        itemId: 1
      })

      const itemType = { id: 3, name: 'truck' }
      const truck = createTruck({
        id: 1,
        weight: createWeight({ value: 2000 }),
        operatingCostPerDay: createMoney({ amount: 500 }),
        quantity: 1
      })
      // Mock the properties to return numbers instead of objects
      truck.weight = 2000
      truck.operatingCostPerDay = 500
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.markTrucksAsSold.mockResolvedValue([1])
      mockMarketRepo.findTruckById.mockResolvedValue(truck)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})
      mockExternalsService.notifyBulkLogistics.mockResolvedValue({})

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockMarketRepo.markTrucksAsSold).toHaveBeenCalledWith(1, 1)
      expect(mockExternalsService.notifyBulkLogistics).toHaveBeenCalledWith({
        orderId: 1,
        truckName: 'Delivery Truck',
        totalPrice: 10000.00,
        unitWeight: 2000,
        totalWeight: 2000,
        quantity: 1,
        maximumLoad: 4000,
        operatingCostPerDay: 500
      })
    })

    it('should handle order not found', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 999,
        companyName: 'test_company'
      }

      mockMarketRepo.findOrderById.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Order with ID 999 not found')
    })

    it('should handle already completed order', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        status: 'completed'
      })

      mockMarketRepo.findOrderById.mockResolvedValue(order)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Order 1 is already completed')
    })

    it('should handle cancelled order', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        status: 'cancelled'
      })

      mockMarketRepo.findOrderById.mockResolvedValue(order)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Order 1 is cancelled and cannot be paid')
    })

    it('should handle insufficient inventory', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Copper',
        quantity: 100,
        totalPrice: 10000.00,
        status: 'pending',
        item_type_id: 1
      })

      const itemType = { id: 1, name: 'raw_material' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.reduceRawMaterialWeight.mockRejectedValue(new Error('Insufficient quantity'))

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        itemName: 'Copper',
        quantity: 100,
        totalPrice: 10000.00,
        status: 'pending',
        message: 'Order 1 cannot be fulfilled: Insufficient quantity',
        canFulfill: false,
        availableQuantity: undefined
      })
    })

    it('should handle external service failure and enqueue retry', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'bulk_logistics'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Delivery Truck',
        quantity: 1,
        totalPrice: 10000.00,
        status: 'pending',
        item_type_id: 3,
        itemId: 1
      })

      const itemType = { id: 3, name: 'truck' }
      const truck = createTruck({
        id: 1,
        weight: createWeight({ value: 2000 }),
        operatingCostPerDay: createMoney({ amount: 500 }),
        quantity: 1
      })
      // Mock the properties to return numbers instead of objects
      truck.weight = 2000
      truck.operatingCostPerDay = 500
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.markTrucksAsSold.mockResolvedValue([1])
      mockMarketRepo.findTruckById.mockResolvedValue(truck)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})
      mockExternalsService.notifyBulkLogistics.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockRetryQueueService.enqueue).toHaveBeenCalledWith({
        type: 'bulk_logistics',
        payload: expect.objectContaining({
          orderId: 1,
          truckName: 'Delivery Truck'
        }),
        attempt: 1,
        maxAttempts: 5,
        notifyFn: expect.any(Function)
      })
    })

    it('should handle consumer logistics company', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'consumer_logistics'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Delivery Truck',
        quantity: 1,
        totalPrice: 10000.00,
        status: 'pending',
        item_type_id: 3,
        itemId: 1
      })

      const itemType = { id: 3, name: 'truck' }
      const truck = createTruck({
        id: 1,
        weight: createWeight({ value: 2000 }),
        operatingCostPerDay: createMoney({ amount: 500 }),
        quantity: 1
      })
      // Mock the properties to return numbers instead of objects
      truck.weight = 2000
      truck.operatingCostPerDay = 500
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.markTrucksAsSold.mockResolvedValue([1])
      mockMarketRepo.findTruckById.mockResolvedValue(truck)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})
      mockExternalsService.notifyBulkLogistics.mockResolvedValue({})

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockExternalsService.notifyBulkLogistics).toHaveBeenCalled()
    })

    it('should handle machine notification failure and enqueue retry', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        itemName: 'recycling_machine',
        quantity: 1,
        totalPrice: 5000.00,
        status: 'pending',
        item_type_id: 2,
        itemId: 1
      })

      const itemType = { id: 2, name: 'machine' }
      const machine = createMachine({
        id: 1,
        weight: createWeight({ value: 1000 }),
        quantity: 1
      })
      // Mock the weight property to return a number instead of Weight object
      machine.weight = 1000
      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(itemType)
      mockMarketRepo.markMachinesAsSold.mockResolvedValue([1])
      mockMarketRepo.findMachineById.mockResolvedValue(machine)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})
      mockExternalsService.notifyRecyclersMachineData.mockRejectedValue(new Error('API error'))

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockRetryQueueService.enqueue).toHaveBeenCalledWith({
        type: 'recycler',
        payload: JSON.stringify({
          orderId: 1,
          totalWeight: 1000
        }),
        attempt: 1,
        maxAttempts: 5,
        notifyFn: expect.any(Function)
      })
    })

    it('should handle missing item type gracefully', async () => {
      // Arrange
      const input: PayOrderInput = {
        orderId: 1,
        companyName: 'test_company'
      }

      const order = createOrder({
        id: 1,
        itemName: 'Unknown Item',
        quantity: 1,
        totalPrice: 100.00,
        status: 'pending',
        item_type_id: null
      })

      const updatedOrder = { ...order, status: 'completed' }

      mockMarketRepo.findOrderById.mockResolvedValue(order)
      mockItemTypeRepo.findById.mockResolvedValue(null)
      mockMarketRepo.reduceRawMaterialWeight.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(updatedOrder)
      mockMarketRepo.saveCollection.mockResolvedValue({})

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.canFulfill).toBe(true)
      expect(mockMarketRepo.reduceRawMaterialWeight).toHaveBeenCalledWith('Unknown Item', 1)
    })
  })
})