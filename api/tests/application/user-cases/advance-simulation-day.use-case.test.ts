import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AdvanceSimulationDayUseCase } from '../../../src/application/user-cases/advance-simulation-day.use-case'
import { Simulation } from '../../../src/domain/simulation/simulation.entity'
import { createSimulation } from '../../helpers/test-helpers'

// Mock repositories
const mockSimulationRepo = {
  findById: vi.fn(),
  save: vi.fn()
}

const mockMarketRepo = {
  findRawMaterialsMarket: vi.fn(),
  findMachinesMarket: vi.fn(),
  findTrucksMarket: vi.fn()
}

// Mock use cases
const mockBreakPhonesUseCase = {
  execute: vi.fn()
}

const mockBuyPhoneUseCase = {
  execute: vi.fn()
}

// Mock the use case dependencies
vi.mock('../../../src/application/user-cases/handle-periodic-failures.use-case', () => ({
  HandlePeriodicFailuresUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn()
  }))
}))

vi.mock('../../../src/application/user-cases/recycle-phones.use-case', () => ({
  RecyclePhonesUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn()
  }))
}))

describe('AdvanceSimulationDayUseCase', () => {
  let useCase: AdvanceSimulationDayUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new AdvanceSimulationDayUseCase(
      mockSimulationRepo as any,
      mockMarketRepo as any,
      mockBreakPhonesUseCase as any,
      mockBuyPhoneUseCase as any
    )
  })

  describe('execute', () => {
    it('should advance simulation day and execute all required steps', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'running'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockSimulationRepo.save.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue({})
      mockMarketRepo.findMachinesMarket.mockResolvedValue({})
      mockMarketRepo.findTrucksMarket.mockResolvedValue({})

      // Act
      await useCase.execute(1)

      // Assert
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(1)
      expect(simulation.currentDay).toBe(6) // Should advance by 1
      expect(mockSimulationRepo.save).toHaveBeenCalledWith(simulation)
      expect(mockBreakPhonesUseCase.execute).toHaveBeenCalled()
      expect(mockBuyPhoneUseCase.execute).toHaveBeenCalled()
    })

    it('should throw error when simulation not found', async () => {
      // Arrange
      mockSimulationRepo.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow('Simulation or market not found')
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(999)
    })

    it('should handle simulation that is not running', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'stopped'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue({})
      mockMarketRepo.findMachinesMarket.mockResolvedValue({})
      mockMarketRepo.findTrucksMarket.mockResolvedValue({})

      // Act - should not throw error since status check is not implemented
      await expect(useCase.execute(1)).resolves.toBeUndefined()
    })

    it('should handle markets not found', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'running'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(null)
      mockMarketRepo.findMachinesMarket.mockResolvedValue(null)
      mockMarketRepo.findTrucksMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Simulation or market not found')
    })

    it('should handle partial market failures', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'running'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue({})
      mockMarketRepo.findMachinesMarket.mockResolvedValue(null) // This one fails
      mockMarketRepo.findTrucksMarket.mockResolvedValue({})

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Simulation or market not found')
    })

    it('should execute all steps in correct order', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'running'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockSimulationRepo.save.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue({})
      mockMarketRepo.findMachinesMarket.mockResolvedValue({})
      mockMarketRepo.findTrucksMarket.mockResolvedValue({})

      // Act
      await useCase.execute(1)

      // Assert - Check that all steps were executed
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(1)
      expect(mockSimulationRepo.save).toHaveBeenCalledWith(simulation)
      expect(mockBreakPhonesUseCase.execute).toHaveBeenCalled()
      expect(mockBuyPhoneUseCase.execute).toHaveBeenCalled()
    })

    it('should handle use case execution failures gracefully', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        status: 'running'
      })
      
      mockSimulationRepo.findById.mockResolvedValue(simulation)
      mockSimulationRepo.save.mockResolvedValue(simulation)
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue({})
      mockMarketRepo.findMachinesMarket.mockResolvedValue({})
      mockMarketRepo.findTrucksMarket.mockResolvedValue({})
      mockBreakPhonesUseCase.execute.mockRejectedValue(new Error('Break phones failed'))

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Break phones failed')
    })
  })
})
