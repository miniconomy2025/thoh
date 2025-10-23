import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetMachinesUseCase } from '../../../src/application/user-cases/get-machines.use-case'
import { Machine } from '../../../src/domain/market/equipment.entity'
import { createMachine, createMoney, createWeight } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findMachinesMarket: vi.fn()
}

const mockMachineStaticRepo = {
  findAll: vi.fn()
}

// Mock the static repository
vi.mock('../../../src/infrastructure/persistence/postgres/machine-static.repository', () => ({
  MachineStaticRepository: vi.fn().mockImplementation(() => mockMachineStaticRepo)
}))

describe('GetMachinesUseCase', () => {
  let useCase: GetMachinesUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetMachinesUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should return empty array when no machines available', async () => {
      // Arrange
      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([])
      }
      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual({ machines: [] })
      expect(mockMarketRepo.findMachinesMarket).toHaveBeenCalled()
    })

    it('should throw error when machines market not found', async () => {
      // Arrange
      mockMarketRepo.findMachinesMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Machines market not found')
    })

    it('should return machines with static data', async () => {
      // Arrange
      const machine = createMachine({ 
        id: 1, 
        machineStaticId: 1, 
        cost: createMoney({ amount: 1000 }),
        weight: createWeight({ value: 50 }),
        quantity: 2
      })
      
      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([machine])
      }
      
      const mockStaticData = {
        id: 1,
        name: 'Test Machine',
        description: 'A test machine'
      }
      
      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([mockStaticData])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.machines).toHaveLength(1)
      expect(result.machines[0]).toMatchObject({
        machineName: 'Test Machine',
        inputs: 'A test machine',
        quantity: 2,
        inputRatio: { copper: 2, plastic: 1 },
        productionRate: 500,
        price: 1000,
        weight: 50
      })
    })

    it('should handle machines without static data', async () => {
      // Arrange
      const machine = createMachine({ 
        id: 1, 
        machineStaticId: 999, // Non-existent static ID
        cost: createMoney({ amount: 1000 }),
        weight: createWeight({ value: 50 }),
        quantity: 1
      })
      
      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([machine])
      }
      
      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([]) // No static data

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.machines).toEqual([]) // Should be empty since no static data
    })
  })
})
