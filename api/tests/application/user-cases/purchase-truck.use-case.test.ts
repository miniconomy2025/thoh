import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PurchaseTruckUseCase } from '../../../src/application/user-cases/purchase-truck.use-case'
import { Truck } from '../../../src/domain/market/equipment.entity'
import { createTruck, createMoney, createWeight } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findTrucksMarket: vi.fn(),
  saveOrder: vi.fn()
}

const mockVehicleStaticRepo = {
  findAll: vi.fn()
}

const mockItemTypeRepo = {
  findTruckTypeId: vi.fn()
}

// Mock the repositories
vi.mock('../../../src/infrastructure/persistence/postgres/vehicle-static.repository', () => ({
  VehicleStaticRepository: vi.fn().mockImplementation(() => mockVehicleStaticRepo)
}))

vi.mock('../../../src/infrastructure/persistence/postgres/item-type.repository', () => ({
  ItemTypeRepository: vi.fn().mockImplementation(() => mockItemTypeRepo)
}))

describe('PurchaseTruckUseCase', () => {
  let useCase: PurchaseTruckUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new PurchaseTruckUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should successfully purchase a truck', async () => {
      // Arrange
      const truck = createTruck({
        id: 1,
        vehicleStaticId: 1,
        cost: createMoney({ amount: 2000 }),
        weight: createWeight({ value: 100 }),
        quantity: 1
      })

      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([truck])
      }

      const mockStaticTruck = {
        id: 1,
        name: 'Test Truck',
        description: 'A test truck'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Truck',
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 2,
        item_type_id: 1,
        orderDate: undefined
      }

      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([mockStaticTruck])
      mockItemTypeRepo.findTruckTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      // Act
      const result = await useCase.execute({
        truckName: 'Test Truck',
        quantity: 2,
        simulationDate: undefined
      })

      // Assert
      expect(result).toEqual({
        orderId: 1,
        truckName: 'Test Truck',
        totalPrice: 4000,
        unitWeight: 100,
        totalWeight: 200,
        quantity: 2,
        maximumLoad: 200,
        operatingCostPerDay: '500/day',
        bankAccount: '000000000000'
      })

      expect(mockMarketRepo.findTrucksMarket).toHaveBeenCalled()
      expect(mockVehicleStaticRepo.findAll).toHaveBeenCalled()
      expect(mockItemTypeRepo.findTruckTypeId).toHaveBeenCalled()
      expect(mockMarketRepo.saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          itemName: 'Test Truck',
          quantity: 2,
          unitPrice: 2000,
          totalPrice: 4000,
          currency: 'ZAR',
          status: 'pending',
          itemId: 1,
          marketId: 2,
          item_type_id: 1
        })
      )
    })

    it('should throw error when trucks market not found', async () => {
      // Arrange
      mockMarketRepo.findTrucksMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute({
        truckName: 'Test Truck',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow('Trucks market not found')
    })

    it('should throw error when truck not found in static table', async () => {
      // Arrange
      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([])
      }

      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([])

      // Act & Assert
      await expect(useCase.execute({
        truckName: 'NonExistent Truck',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow("Truck 'NonExistent Truck' not found in static table")
    })

    it('should throw error when truck not found in market', async () => {
      // Arrange
      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([])
      }

      const mockStaticTruck = {
        id: 1,
        name: 'Test Truck',
        description: 'A test truck'
      }

      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([mockStaticTruck])

      // Act & Assert
      await expect(useCase.execute({
        truckName: 'Test Truck',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow("Truck 'Test Truck' not found in market")
    })

    it('should handle simulation date when provided', async () => {
      // Arrange
      const truck = createTruck({
        id: 1,
        vehicleStaticId: 1,
        cost: createMoney({ amount: 2000 }),
        weight: createWeight({ value: 100 }),
        quantity: 1
      })

      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([truck])
      }

      const mockStaticTruck = {
        id: 1,
        name: 'Test Truck',
        description: 'A test truck'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Truck',
        quantity: 1,
        unitPrice: 2000,
        totalPrice: 2000,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 2,
        item_type_id: 1,
        orderDate: new Date('2024-01-01')
      }

      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([mockStaticTruck])
      mockItemTypeRepo.findTruckTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      const simulationDate = new Date('2024-01-01')

      // Act
      await useCase.execute({
        truckName: 'Test Truck',
        quantity: 1,
        simulationDate: simulationDate
      })

      // Assert
      expect(mockMarketRepo.saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderDate: simulationDate
        })
      )
    })

    it('should calculate correct total price for multiple quantities', async () => {
      // Arrange
      const truck = createTruck({
        id: 1,
        vehicleStaticId: 1,
        cost: createMoney({ amount: 1500 }),
        weight: createWeight({ value: 80 }),
        quantity: 1
      })

      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([truck])
      }

      const mockStaticTruck = {
        id: 1,
        name: 'Test Truck',
        description: 'A test truck'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Truck',
        quantity: 3,
        unitPrice: 1500,
        totalPrice: 4500,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 2,
        item_type_id: 1,
        orderDate: undefined
      }

      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([mockStaticTruck])
      mockItemTypeRepo.findTruckTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      // Act
      const result = await useCase.execute({
        truckName: 'Test Truck',
        quantity: 3,
        simulationDate: undefined
      })

      // Assert
      expect(result.totalPrice).toBe(4500) // 1500 * 3
      expect(result.totalWeight).toBe(240) // 80 * 3
      expect(result.maximumLoad).toBe(160) // 80 * 2
      expect(result.quantity).toBe(3)
    })
  })
})
