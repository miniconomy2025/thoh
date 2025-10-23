import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Machine, Truck } from '../../../src/domain/market/equipment.entity'
import { createMoney, createWeight } from '../../helpers/test-helpers'

describe('Equipment Entities', () => {
  describe('Machine', () => {
    let machine: Machine

    beforeEach(() => {
      machine = new Machine(
        1, // machineStaticId
        createMoney({ amount: 10000, currency: 'ZAR' }),
        createWeight({ value: 500, unit: 'kg' }),
        { copper: 2, plastic: 1 }, // materialRatio
        500, // productionRate
        1, // quantity
        1, // id
        false // sold
      )
    })

    describe('constructor', () => {
      it('should set all properties correctly', () => {
        expect(machine.machineStaticId).toBe(1)
        expect(machine.cost.amount).toBe(10000)
        expect(machine.cost.currency).toBe('ZAR')
        expect(machine.weight.value).toBe(500)
        expect(machine.weight.unit).toBe('kg')
        expect(machine.materialRatio).toEqual({ copper: 2, plastic: 1 })
        expect(machine.productionRate).toBe(500)
        expect(machine.quantity).toBe(1)
        expect(machine.id).toBe(1)
        expect(machine.sold).toBe(false)
      })

      it('should set sold to false by default', () => {
        const machineWithoutSold = new Machine(
          1,
          createMoney(),
          createWeight(),
          { copper: 1 },
          100,
          1,
          1
        )
        
        expect(machineWithoutSold.sold).toBe(false)
      })
    })

    describe('machineStaticId getter', () => {
      it('should return the staticId', () => {
        expect(machine.machineStaticId).toBe(1)
      })

      it('should return correct value for different staticId', () => {
        const machine2 = new Machine(
          42,
          createMoney(),
          createWeight(),
          { copper: 1 },
          100,
          1,
          1
        )
        
        expect(machine2.machineStaticId).toBe(42)
      })
    })

    describe('sold property', () => {
      it('should be mutable', () => {
        expect(machine.sold).toBe(false)
        
        machine.sold = true
        
        expect(machine.sold).toBe(true)
      })
    })

    describe('inherited properties', () => {
      it('should inherit from Equipment base class', () => {
        expect(machine.id).toBeDefined()
        expect(machine.staticId).toBe(1)
        expect(machine.cost).toBeDefined()
        expect(machine.weight).toBeDefined()
      })
    })
  })

  describe('Truck', () => {
    let truck: Truck

    beforeEach(() => {
      truck = new Truck(
        1, // vehicleStaticId
        createMoney({ amount: 50000, currency: 'ZAR' }),
        createWeight({ value: 2000, unit: 'kg' }),
        createMoney({ amount: 500, currency: 'ZAR' }), // operatingCostPerDay
        1, // quantity
        1, // id
        false // sold
      )
    })

    describe('constructor', () => {
      it('should set all properties correctly', () => {
        expect(truck.vehicleStaticId).toBe(1)
        expect(truck.cost.amount).toBe(50000)
        expect(truck.cost.currency).toBe('ZAR')
        expect(truck.weight.value).toBe(2000)
        expect(truck.weight.unit).toBe('kg')
        expect(truck.operatingCostPerDay.amount).toBe(500)
        expect(truck.operatingCostPerDay.currency).toBe('ZAR')
        expect(truck.quantity).toBe(1)
        expect(truck.id).toBe(1)
        expect(truck.sold).toBe(false)
      })

      it('should set sold to false by default', () => {
        const truckWithoutSold = new Truck(
          1,
          createMoney(),
          createWeight(),
          createMoney(),
          1,
          1
        )
        
        expect(truckWithoutSold.sold).toBe(false)
      })
    })

    describe('vehicleStaticId getter', () => {
      it('should return the staticId', () => {
        expect(truck.vehicleStaticId).toBe(1)
      })

      it('should return correct value for different staticId', () => {
        const truck2 = new Truck(
          42,
          createMoney(),
          createWeight(),
          createMoney(),
          1,
          1
        )
        
        expect(truck2.vehicleStaticId).toBe(42)
      })
    })

    describe('maximumLoad getter', () => {
      it('should return weight.value', () => {
        expect(truck.maximumLoad).toBe(2000)
      })

      it('should return correct value for different weight', () => {
        const truck2 = new Truck(
          1,
          createMoney(),
          createWeight({ value: 5000, unit: 'kg' }),
          createMoney(),
          1,
          1
        )
        
        expect(truck2.maximumLoad).toBe(5000)
      })
    })

    describe('sold property', () => {
      it('should be mutable', () => {
        expect(truck.sold).toBe(false)
        
        truck.sold = true
        
        expect(truck.sold).toBe(true)
      })
    })

    describe('inherited properties', () => {
      it('should inherit from Equipment base class', () => {
        expect(truck.id).toBeDefined()
        expect(truck.staticId).toBe(1)
        expect(truck.cost).toBeDefined()
        expect(truck.weight).toBeDefined()
      })
    })
  })

  describe('Equipment base class behavior', () => {
    it('should set id when provided', () => {
      const machine = new Machine(
        1,
        createMoney(),
        createWeight(),
        { copper: 1 },
        100,
        1,
        42 // id provided
      )
      
      expect(machine.id).toBe(42)
    })
  })
})
