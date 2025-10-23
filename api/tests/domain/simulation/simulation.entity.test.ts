import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Simulation } from '../../../src/domain/simulation/simulation.entity'
import { createSimulation, mockTime, TEST_DATES } from '../../helpers/test-helpers'

describe('Simulation Entity', () => {
  let simulation: Simulation

  beforeEach(() => {
    simulation = createSimulation()
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(simulation.status).toBe('not_started')
      expect(simulation.currentDay).toBe(0)
      expect(simulation.id).toBe(1)
      expect(simulation.simulationId).toBe(1)
    })
  })

  describe('start method', () => {
    it('should set correct initial state when started', () => {
      const fixedTime = TEST_DATES.JANUARY_1_2024
      mockTime(fixedTime)
      
      simulation.start()
      
      expect(simulation.status).toBe('running')
      expect(simulation.currentDay).toBe(1)
      expect(simulation.startDate).toBeInstanceOf(Date)
      expect(simulation.unixEpochStartTime).toBeTypeOf('number')
      expect(simulation.unixEpochStartTime).toBeGreaterThan(0)
    })

    it('should set unixEpochStartTime to current timestamp', () => {
      const fixedTime = TEST_DATES.JANUARY_1_2024
      mockTime(fixedTime)
      
      simulation.start()
      
      expect(simulation.unixEpochStartTime).toBe(fixedTime.getTime())
    })

    it('should preserve startDate when starting', () => {
      const originalStartDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = originalStartDate
      
      simulation.start()
      
      expect(simulation.startDate).toBeInstanceOf(Date)
      expect(simulation.startDate.getTime()).toBe(originalStartDate.getTime())
    })
  })

  describe('advanceDay method', () => {
    it('should increment currentDay by 1', () => {
      simulation.currentDay = 5
      
      simulation.advanceDay()
      
      expect(simulation.currentDay).toBe(6)
    })

    it('should work from initial state', () => {
      simulation.currentDay = 0
      
      simulation.advanceDay()
      
      expect(simulation.currentDay).toBe(1)
    })

    it('should work multiple times', () => {
      simulation.currentDay = 0
      
      simulation.advanceDay()
      simulation.advanceDay()
      simulation.advanceDay()
      
      expect(simulation.currentDay).toBe(3)
    })
  })

  describe('end method', () => {
    it('should set status to completed', () => {
      simulation.status = 'running'
      
      simulation.end()
      
      expect(simulation.status).toBe('completed')
    })

    it('should not change other properties', () => {
      simulation.status = 'running'
      simulation.currentDay = 10
      
      simulation.end()
      
      expect(simulation.status).toBe('completed')
      expect(simulation.currentDay).toBe(10)
    })
  })

  describe('getCurrentSimDate method', () => {
    it('should return start date + 1 day when currentDay is 1', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 1
      
      const result = simulation.getCurrentSimDate()
      
      expect(result).toBeInstanceOf(Date)
      const expectedDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
      expect(result.getTime()).toBe(expectedDate.getTime())
    })

    it('should return correct date for day 2', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 2
      
      const result = simulation.getCurrentSimDate()
      
      expect(result).toBeInstanceOf(Date)
      const expectedDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)
      expect(result.getTime()).toBe(expectedDate.getTime())
    })

    it('should return correct date for day 10', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 10
      
      const result = simulation.getCurrentSimDate()
      
      expect(result).toBeInstanceOf(Date)
      const expectedDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000)
      expect(result.getTime()).toBe(expectedDate.getTime())
    })

    it('should handle month transitions', () => {
      const startDate = new Date('2024-01-31T00:00:00Z')
      simulation.startDate = startDate
      simulation.currentDay = 2
      
      const result = simulation.getCurrentSimDate()
      
      expect(result).toBeInstanceOf(Date)
      const expectedDate = new Date('2024-02-02T00:00:00Z')
      expect(result.getTime()).toBe(expectedDate.getTime())
    })
  })

  describe('getCurrentSimDateString method', () => {
    it('should return ISO date string for day 1', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 1
      
      const result = simulation.getCurrentSimDateString()
      
      expect(result).toBe('2024-01-02')
    })

    it('should return ISO date string for day 2', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 2
      
      const result = simulation.getCurrentSimDateString()
      
      expect(result).toBe('2024-01-03')
    })

    it('should return ISO date string for day 15', () => {
      const startDate = TEST_DATES.JANUARY_1_2024
      simulation.startDate = startDate
      simulation.currentDay = 15
      
      const result = simulation.getCurrentSimDateString()
      
      expect(result).toBe('2024-01-16')
    })
  })

  describe('getUnixEpochStartTime method', () => {
    it('should return the stored unix epoch start time', () => {
      const testTime = 1234567890000
      simulation.unixEpochStartTime = testTime
      
      const result = simulation.getUnixEpochStartTime()
      
      expect(result).toBe(testTime)
    })

    it('should return the time set during start method', () => {
      const fixedTime = TEST_DATES.JANUARY_1_2024
      mockTime(fixedTime)
      
      simulation.start()
      
      expect(simulation.getUnixEpochStartTime()).toBe(fixedTime.getTime())
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete simulation lifecycle', () => {
      const fixedTime = TEST_DATES.JANUARY_1_2024
      mockTime(fixedTime)
      
      // Start simulation
      simulation.start()
      expect(simulation.status).toBe('running')
      expect(simulation.currentDay).toBe(1)
      
      // Advance several days
      simulation.advanceDay()
      simulation.advanceDay()
      simulation.advanceDay()
      expect(simulation.currentDay).toBe(4)
      
      // Check date calculations
      const currentDate = simulation.getCurrentSimDate()
      const expectedDate = new Date(fixedTime.getTime() + 4 * 24 * 60 * 60 * 1000)
      expect(currentDate.getTime()).toBe(expectedDate.getTime())
      
      // End simulation
      simulation.end()
      expect(simulation.status).toBe('completed')
    })
  })
})
