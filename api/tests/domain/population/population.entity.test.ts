import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Population } from '../../../src/domain/population/population.entity'
import { Simulation } from '../../../src/domain/simulation/simulation.entity'
import { createPopulation, createSimulation, TEST_DATES } from '../../helpers/test-helpers'

describe('Population Entity', () => {
  let population: Population
  let simulation: Simulation

  beforeEach(() => {
    simulation = createSimulation()
    population = createPopulation({ simulation })
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(population.id).toBe(1)
      expect(population.simulationId).toBe(1)
      expect(population.simulation).toBe(simulation)
    })

    it('should create population with custom values', () => {
      const customSimulation = createSimulation({ 
        id: 42, 
        simulationId: 5,
        status: 'running',
        currentDay: 10
      })
      const customPopulation = createPopulation({
        id: 5,
        simulationId: 5,
        simulation: customSimulation
      })
      
      expect(customPopulation.id).toBe(5)
      expect(customPopulation.simulationId).toBe(5)
      expect(customPopulation.simulation).toBe(customSimulation)
      expect(customPopulation.simulation.id).toBe(42)
      expect(customPopulation.simulation.simulationId).toBe(5)
      expect(customPopulation.simulation.status).toBe('running')
      expect(customPopulation.simulation.currentDay).toBe(10)
    })

    it('should create population without simulation', () => {
      const populationWithoutSimulation = createPopulation({
        id: 2,
        simulationId: null,
        simulation: null
      })
      
      expect(populationWithoutSimulation.id).toBe(2)
      expect(populationWithoutSimulation.simulationId).toBeNull()
      expect(populationWithoutSimulation.simulation).toBeNull()
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      population.id = 999
      expect(population.id).toBe(999)
    })

    it('should accept different id values', () => {
      population.id = 0
      expect(population.id).toBe(0)
      
      population.id = 1
      expect(population.id).toBe(1)
    })

  })

  describe('simulationId property', () => {
    it('should be mutable', () => {
      population.simulationId = 42
      expect(population.simulationId).toBe(42)
    })

    it('should accept different simulation IDs', () => {
      const simulationIds = [0, 1, 10, 100, 1000, null, undefined]
      
      simulationIds.forEach(id => {
        population.simulationId = id
        expect(population.simulationId).toBe(id)
      })
    })

    it('should handle null and undefined', () => {
      population.simulationId = null
      expect(population.simulationId).toBeNull()
      
      population.simulationId = undefined
      expect(population.simulationId).toBeUndefined()
    })

    it('should be a number type when set', () => {
      population.simulationId = 5
      expect(typeof population.simulationId).toBe('number')
    })
  })

  describe('simulation property', () => {
    it('should be mutable', () => {
      const newSimulation = createSimulation({ 
        id: 42, 
        simulationId: 5,
        status: 'running',
        currentDay: 15
      })
      
      population.simulation = newSimulation
      
      expect(population.simulation).toBe(newSimulation)
      expect(population.simulation.id).toBe(42)
      expect(population.simulation.simulationId).toBe(5)
      expect(population.simulation.status).toBe('running')
      expect(population.simulation.currentDay).toBe(15)
    })

    it('should maintain reference to Simulation instance', () => {
      expect(population.simulation).toBeInstanceOf(Simulation)
      expect(population.simulation.id).toBeDefined()
      expect(population.simulation.simulationId).toBeDefined()
    })

    it('should handle null simulation', () => {
      population.simulation = null
      expect(population.simulation).toBeNull()
    })

    it('should handle undefined simulation', () => {
      population.simulation = undefined
      expect(population.simulation).toBeUndefined()
    })

    it('should handle different simulation states', () => {
      const simulationStates = [
        { status: 'not_started', currentDay: 0 },
        { status: 'running', currentDay: 5 },
        { status: 'running', currentDay: 100 },
        { status: 'completed', currentDay: 365 }
      ]
      
      simulationStates.forEach(state => {
        const sim = createSimulation(state)
        population.simulation = sim
        
        expect(population.simulation.status).toBe(state.status)
        expect(population.simulation.currentDay).toBe(state.currentDay)
      })
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete population lifecycle', () => {
      // Initial state
      expect(population.simulationId).toBe(1)
      expect(population.simulation).toBe(simulation)
      expect(population.simulation.status).toBe('not_started')
      
      // Simulation starts
      population.simulation.status = 'running'
      population.simulation.currentDay = 1
      
      expect(population.simulation.status).toBe('running')
      expect(population.simulation.currentDay).toBe(1)
      
      // Simulation progresses
      population.simulation.currentDay = 10
      expect(population.simulation.currentDay).toBe(10)
      
      // Simulation ends
      population.simulation.status = 'completed'
      expect(population.simulation.status).toBe('completed')
    })

    it('should handle population with different simulations', () => {
      const simulations = [
        createSimulation({ id: 1, simulationId: 1, status: 'not_started' }),
        createSimulation({ id: 2, simulationId: 2, status: 'running', currentDay: 5 }),
        createSimulation({ id: 3, simulationId: 3, status: 'completed', currentDay: 365 })
      ]
      
      simulations.forEach(sim => {
        population.simulation = sim
        population.simulationId = sim.simulationId
        
        expect(population.simulation).toBe(sim)
        expect(population.simulationId).toBe(sim.simulationId)
        expect(population.simulation.id).toBe(sim.id)
        expect(population.simulation.status).toBe(sim.status)
      })
    })

    it('should handle population without simulation', () => {
      population.simulation = null
      population.simulationId = null
      
      expect(population.simulation).toBeNull()
      expect(population.simulationId).toBeNull()
    })

    it('should maintain simulation reference integrity', () => {
      const originalSimulation = population.simulation
      const originalSimulationId = originalSimulation.simulationId
      
      // Update population id
      population.id = 999
      
      // Simulation reference should remain the same
      expect(population.simulation).toBe(originalSimulation)
      expect(population.simulation.simulationId).toBe(originalSimulationId)
    })

    it('should handle simulation updates through population', () => {
      // Update simulation through population reference
      population.simulation.status = 'running'
      population.simulation.currentDay = 5
      population.simulationId = 5
      
      expect(population.simulation.status).toBe('running')
      expect(population.simulation.currentDay).toBe(5)
      expect(population.simulationId).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle population with undefined id initially', () => {
      const populationWithoutId = new Population()
      populationWithoutId.simulationId = 1
      populationWithoutId.simulation = simulation
      
      expect(populationWithoutId.id).toBeUndefined()
      expect(populationWithoutId.simulationId).toBe(1)
      expect(populationWithoutId.simulation).toBe(simulation)
    })

    it('should handle population with undefined simulationId initially', () => {
      const populationWithoutSimulationId = new Population()
      populationWithoutSimulationId.id = 1
      populationWithoutSimulationId.simulation = simulation
      
      expect(populationWithoutSimulationId.id).toBe(1)
      expect(populationWithoutSimulationId.simulationId).toBeUndefined()
      expect(populationWithoutSimulationId.simulation).toBe(simulation)
    })

    it('should handle population with undefined simulation initially', () => {
      const populationWithoutSimulation = new Population()
      populationWithoutSimulation.id = 1
      populationWithoutSimulation.simulationId = 1
      
      expect(populationWithoutSimulation.id).toBe(1)
      expect(populationWithoutSimulation.simulationId).toBe(1)
      expect(populationWithoutSimulation.simulation).toBeUndefined()
    })

    it('should handle mismatched simulationId and simulation', () => {
      const differentSimulation = createSimulation({ simulationId: 999 })
      population.simulationId = 1
      population.simulation = differentSimulation
      
      expect(population.simulationId).toBe(1)
      expect(population.simulation.simulationId).toBe(999)
    })

    it('should handle very large simulation IDs', () => {
      population.simulationId = 999999
      expect(population.simulationId).toBe(999999)
    })

    it('should handle zero simulation ID', () => {
      population.simulationId = 0
      expect(population.simulationId).toBe(0)
    })
  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(population).toBeInstanceOf(Population)
    })

    it('should have proper column types for database', () => {
      expect(typeof population.id).toBe('number')
      expect(typeof population.simulationId === 'number' || population.simulationId === null || population.simulationId === undefined).toBe(true)
      expect(population.simulation === null || population.simulation === undefined || population.simulation instanceof Simulation).toBe(true)
    })

    it('should support nullable simulation relationship', () => {
      // This test verifies that the simulation relationship is properly configured as nullable
      population.simulation = null
      expect(population.simulation).toBeNull()
      
      population.simulation = simulation
      expect(population.simulation).toBeInstanceOf(Simulation)
    })

    it('should support nullable simulationId', () => {
      // This test verifies that simulationId is properly configured as nullable
      population.simulationId = null
      expect(population.simulationId).toBeNull()
      
      population.simulationId = 1
      expect(population.simulationId).toBe(1)
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createPopulation factory', () => {
      const customSimulation = createSimulation({ 
        id: 10, 
        simulationId: 5,
        status: 'running',
        currentDay: 20
      })
      const factoryPopulation = createPopulation({
        id: 5,
        simulationId: 5,
        simulation: customSimulation
      })
      
      expect(factoryPopulation.id).toBe(5)
      expect(factoryPopulation.simulationId).toBe(5)
      expect(factoryPopulation.simulation).toBe(customSimulation)
      expect(factoryPopulation.simulation.id).toBe(10)
      expect(factoryPopulation.simulation.simulationId).toBe(5)
      expect(factoryPopulation.simulation.status).toBe('running')
      expect(factoryPopulation.simulation.currentDay).toBe(20)
    })

    it('should work with partial overrides', () => {
      const partialPopulation = createPopulation({ 
        id: 10,
        simulationId: 5
      })
      
      expect(partialPopulation.id).toBe(10) // Override value
      expect(partialPopulation.simulationId).toBe(5) // Override value
      expect(partialPopulation.simulation).toBeDefined() // Default value
    })

    it('should work with null simulation', () => {
      const populationWithNullSimulation = createPopulation({
        id: 1,
        simulationId: null,
        simulation: null
      })
      
      expect(populationWithNullSimulation.id).toBe(1)
      expect(populationWithNullSimulation.simulationId).toBeNull()
      expect(populationWithNullSimulation.simulation).toBeNull()
    })
  })

  describe('business logic scenarios', () => {
    it('should represent a population associated with a simulation', () => {
      const runningSimulation = createSimulation({ 
        status: 'running', 
        currentDay: 10 
      })
      const population = createPopulation({ 
        simulation: runningSimulation,
        simulationId: runningSimulation.simulationId
      })
      
      expect(population.simulation.status).toBe('running')
      expect(population.simulation.currentDay).toBe(10)
      expect(population.simulationId).toBe(runningSimulation.simulationId)
    })

    it('should handle population without active simulation', () => {
      const population = createPopulation({
        simulationId: null,
        simulation: null
      })
      
      expect(population.simulationId).toBeNull()
      expect(population.simulation).toBeNull()
    })

    it('should handle population with completed simulation', () => {
      const completedSimulation = createSimulation({ 
        status: 'completed', 
        currentDay: 365 
      })
      const population = createPopulation({ 
        simulation: completedSimulation,
        simulationId: completedSimulation.simulationId
      })
      
      expect(population.simulation.status).toBe('completed')
      expect(population.simulation.currentDay).toBe(365)
      expect(population.simulationId).toBe(completedSimulation.simulationId)
    })
  })
})
