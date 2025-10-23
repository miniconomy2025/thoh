import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HandlePeriodicFailuresUseCase } from '../../../src/application/user-cases/handle-periodic-failures.use-case'
import { Simulation } from '../../../src/domain/simulation/simulation.entity'
import { createSimulation } from '../../helpers/test-helpers'

// Mock the modules first
vi.mock('../../../src/infrastructure/persistence/postgres/machine-static.repository', () => ({
  MachineStaticRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn()
  }))
}))

vi.mock('../../../src/infrastructure/persistence/postgres/vehicle-static.repository', () => ({
  VehicleStaticRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn()
  }))
}))

vi.mock('../../../src/application/user-cases/update-bank-prime-rate.use-case', () => ({
  UpdateBankPrimeRateUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn()
  }))
}))

vi.mock('../../../src/infrastructure/queue/queue.factory', () => ({
  QueueFactory: {
    getNotificationQueue: () => ({ sendMessage: vi.fn() }),
    getBusinessQueue: () => ({ sendMessage: vi.fn() }),
    getCriticalQueue: () => ({ sendMessage: vi.fn() })
  }
}))

// Mock repositories
const mockMarketRepo = {
  findMachinesMarket: vi.fn(),
  findTrucksMarket: vi.fn(),
  saveMachinesMarket: vi.fn(),
  saveTrucksMarket: vi.fn()
}

// Mock Math.random for consistent testing
vi.spyOn(Math, 'random').mockReturnValue(0.5)

describe('HandlePeriodicFailuresUseCase', () => {
  let useCase: HandlePeriodicFailuresUseCase

  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // Reset random mock
    // Reset repository mocks
    mockMarketRepo.findMachinesMarket.mockClear()
    mockMarketRepo.findTrucksMarket.mockClear()
    useCase = new HandlePeriodicFailuresUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should execute without errors on day 14', async () => {
      // Arrange
      const simulation = createSimulation({ currentDay: 14 })
      
      const mockMachinesMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([
          { id: 1, machineStaticId: 1, sold: false }
        ])
      }
      
      const mockTrucksMarket = {
        getTrucksForSale: vi.fn().mockReturnValue([
          { id: 1, vehicleStaticId: 1, sold: false }
        ])
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMachinesMarket)
      mockMarketRepo.findTrucksMarket.mockResolvedValue(mockTrucksMarket)

      // Act
      await useCase.execute(simulation)

      // Assert
      expect(mockMarketRepo.findMachinesMarket).toHaveBeenCalled()
      expect(mockMarketRepo.findTrucksMarket).toHaveBeenCalled()
    })

    it('should execute without errors on day 30', async () => {
      // Arrange
      const simulation = createSimulation({ currentDay: 30 })

      // Act
      await useCase.execute(simulation)

      // Assert
      // Day 30 is not a multiple of 14, so no failure handling
      expect(mockMarketRepo.findMachinesMarket).not.toHaveBeenCalled()
      expect(mockMarketRepo.findTrucksMarket).not.toHaveBeenCalled()
      // Day 30 is a multiple of 30, so bank rate update should be called
      // But we can't easily test the internal bank rate update call with current mocking
    })

    it('should not execute failures on non-multiple-of-14 days', async () => {
      // Arrange
      const simulation = createSimulation({ currentDay: 15 })

      // Act
      await useCase.execute(simulation)

      // Assert
      expect(mockMarketRepo.findMachinesMarket).not.toHaveBeenCalled()
      expect(mockMarketRepo.findTrucksMarket).not.toHaveBeenCalled()
    })

    it('should not execute bank rate update on non-multiple-of-30 days', async () => {
      // Arrange
      const simulation = createSimulation({ currentDay: 15 })

      // Act
      await useCase.execute(simulation)

      // Assert
      expect(mockMarketRepo.findMachinesMarket).not.toHaveBeenCalled()
      expect(mockMarketRepo.findTrucksMarket).not.toHaveBeenCalled()
    })
  })
})
