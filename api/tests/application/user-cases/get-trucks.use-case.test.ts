import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTrucksUseCase } from '../../../src/application/user-cases/get-trucks.use-case'
import { Truck } from '../../../src/domain/market/equipment.entity'
import { createTruck, createMoney, createWeight } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findTrucksMarket: vi.fn()
}

const mockVehicleStaticRepo = {
  findAll: vi.fn()
}

// Mock the static repository
vi.mock('../../../src/infrastructure/persistence/postgres/vehicle-static.repository', () => ({
  VehicleStaticRepository: vi.fn().mockImplementation(() => mockVehicleStaticRepo)
}))

describe('GetTrucksUseCase', () => {
  let useCase: GetTrucksUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetTrucksUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should return empty array when no trucks available', async () => {
      // Arrange
      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([])
      }
      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([])
      expect(mockMarketRepo.findTrucksMarket).toHaveBeenCalled()
    })

    it('should throw error when trucks market not found', async () => {
      // Arrange
      mockMarketRepo.findTrucksMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Trucks market not found')
    })

    it('should return trucks with static data', async () => {
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
      
      const mockStaticData = {
        id: 1,
        name: 'Test Truck',
        description: 'A test truck'
      }
      
      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([mockStaticData])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        truckName: 'Test Truck',
        description: 'A test truck',
        price: 2000,
        quantity: 1,
        operatingCost: 500,
        maximumLoad: 200
      })
    })

    it('should handle trucks without static data', async () => {
      // Arrange
      const truck = createTruck({ 
        id: 1, 
        vehicleStaticId: 999, // Non-existent static ID
        cost: createMoney({ amount: 2000 }),
        weight: createWeight({ value: 100 }),
        quantity: 1
      })
      
      const mockMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([truck])
      }
      
      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockMarket)
      mockVehicleStaticRepo.findAll.mockResolvedValue([]) // No static data

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([]) // Should be empty since no static data
    })
  })
})
