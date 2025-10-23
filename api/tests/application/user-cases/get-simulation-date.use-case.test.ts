import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetSimulationDateUseCase } from '../../../src/application/user-cases/get-simulation-date.use-case'
import { Simulation } from '../../../src/domain/simulation/simulation.entity'
import { createSimulation } from '../../helpers/test-helpers'

// Mock the repository
const mockSimulationRepo = {
  findById: vi.fn()
}

describe('GetSimulationDateUseCase', () => {
  let useCase: GetSimulationDateUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetSimulationDateUseCase(mockSimulationRepo as any)
  })

  describe('execute', () => {
    it('should return simulation date when simulation exists', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 1, 
        currentDay: 5,
        startDate: new Date('2024-01-01')
      })
      mockSimulationRepo.findById.mockResolvedValue(simulation)

      // Act
      const result = await useCase.execute(1)

      // Assert
      expect(result).toEqual({
        date: simulation.getCurrentSimDateString()
      })
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(1)
    })

    it('should throw error when simulation not found', async () => {
      // Arrange
      mockSimulationRepo.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow('Simulation not found')
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(999)
    })

    it('should handle different simulation days', async () => {
      // Arrange
      const simulation = createSimulation({ 
        id: 2, 
        currentDay: 10,
        startDate: new Date('2024-01-01')
      })
      mockSimulationRepo.findById.mockResolvedValue(simulation)

      // Act
      const result = await useCase.execute(2)

      // Assert
      expect(result.date).toBe(simulation.getCurrentSimDateString())
      expect(mockSimulationRepo.findById).toHaveBeenCalledWith(2)
    })
  })
})
