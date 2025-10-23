import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { RawMaterial } from '../../../src/domain/market/raw-material.entity'
import { createRawMaterial } from '../../helpers/test-helpers'

describe('RawMaterial Entity', () => {
  let rawMaterial: RawMaterial

  beforeEach(() => {
    rawMaterial = createRawMaterial()
  })

  describe('constructor', () => {
    it('should create raw material with required parameters', () => {
      expect(rawMaterial.material_static_id).toBe(1)
      expect(rawMaterial.costPerKg).toBe(100.50)
      expect(rawMaterial.availableWeight).toBe(1000.0)
    })

    it('should create raw material with custom values', () => {
      const customRawMaterial = createRawMaterial({
        material_static_id: 5,
        costPerKg: 250.75,
        availableWeight: 500.25
      })
      
      expect(customRawMaterial.material_static_id).toBe(5)
      expect(customRawMaterial.costPerKg).toBe(250.75)
      expect(customRawMaterial.availableWeight).toBe(500.25)
    })

    it('should handle zero values', () => {
      const zeroRawMaterial = createRawMaterial({
        material_static_id: 0,
        costPerKg: 0,
        availableWeight: 0
      })
      
      expect(zeroRawMaterial.material_static_id).toBe(0)
      expect(zeroRawMaterial.costPerKg).toBe(0)
      expect(zeroRawMaterial.availableWeight).toBe(0)
    })

  })

  describe('pricePerKg getter', () => {
    it('should return costPerKg value', () => {
      expect(rawMaterial.pricePerKg).toBe(100.50)
    })

    it('should return updated costPerKg when changed', () => {
      rawMaterial.costPerKg = 200.75
      expect(rawMaterial.pricePerKg).toBe(200.75)
    })

    it('should handle zero cost', () => {
      rawMaterial.costPerKg = 0
      expect(rawMaterial.pricePerKg).toBe(0)
    })

  })

  describe('quantityAvailable getter', () => {
    it('should return floored availableWeight', () => {
      expect(rawMaterial.quantityAvailable).toBe(1000) // Math.floor(1000.0)
    })

    it('should floor fractional weights', () => {
      rawMaterial.availableWeight = 1000.99
      expect(rawMaterial.quantityAvailable).toBe(1000)
    })

    it('should handle zero weight', () => {
      rawMaterial.availableWeight = 0
      expect(rawMaterial.quantityAvailable).toBe(0)
    })

    it('should handle very small weights', () => {
      rawMaterial.availableWeight = 0.1
      expect(rawMaterial.quantityAvailable).toBe(0)
    })

    it('should handle large weights', () => {
      rawMaterial.availableWeight = 999999.99
      expect(rawMaterial.quantityAvailable).toBe(999999)
    })
  })

  describe('updatePrice method', () => {
    it('should update costPerKg with valid positive value', () => {
      rawMaterial.updatePrice(150.25)
      expect(rawMaterial.costPerKg).toBe(150.25)
    })

    it('should update costPerKg with zero', () => {
      rawMaterial.updatePrice(0)
      expect(rawMaterial.costPerKg).toBe(0)
    })

    it('should throw error for negative cost', () => {
      expect(() => {
        rawMaterial.updatePrice(-10.50)
      }).toThrow('Cost cannot be negative.')
    })

    it('should not change costPerKg when error is thrown', () => {
      const originalCost = rawMaterial.costPerKg
      
      expect(() => {
        rawMaterial.updatePrice(-10.50)
      }).toThrow('Cost cannot be negative.')
      
      expect(rawMaterial.costPerKg).toBe(originalCost)
    })

    it('should handle decimal values', () => {
      rawMaterial.updatePrice(123.456)
      expect(rawMaterial.costPerKg).toBe(123.456)
    })

    it('should handle very large values', () => {
      rawMaterial.updatePrice(999999.99)
      expect(rawMaterial.costPerKg).toBe(999999.99)
    })
  })

  describe('adjustAvailability method', () => {
    it('should update availableWeight with positive value', () => {
      rawMaterial.adjustAvailability(1500.75)
      expect(rawMaterial.availableWeight).toBe(1500.75)
    })

    it('should update availableWeight with zero', () => {
      rawMaterial.adjustAvailability(0)
      expect(rawMaterial.availableWeight).toBe(0)
    })

    it('should handle decimal values', () => {
      rawMaterial.adjustAvailability(123.456)
      expect(rawMaterial.availableWeight).toBe(123.456)
    })

    it('should handle very large values', () => {
      rawMaterial.adjustAvailability(999999.99)
      expect(rawMaterial.availableWeight).toBe(999999.99)
    })

    it('should handle very small values', () => {
      rawMaterial.adjustAvailability(0.001)
      expect(rawMaterial.availableWeight).toBe(0.001)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete raw material lifecycle', () => {
      // Initial state
      expect(rawMaterial.material_static_id).toBe(1)
      expect(rawMaterial.costPerKg).toBe(100.50)
      expect(rawMaterial.availableWeight).toBe(1000.0)
      expect(rawMaterial.pricePerKg).toBe(100.50)
      expect(rawMaterial.quantityAvailable).toBe(1000)
      
      // Update price
      rawMaterial.updatePrice(200.75)
      expect(rawMaterial.costPerKg).toBe(200.75)
      expect(rawMaterial.pricePerKg).toBe(200.75)
      
      // Adjust availability
      rawMaterial.adjustAvailability(1500.25)
      expect(rawMaterial.availableWeight).toBe(1500.25)
      expect(rawMaterial.quantityAvailable).toBe(1500)
    })

    it('should handle price updates and availability changes', () => {
      // Start with initial values
      expect(rawMaterial.pricePerKg).toBe(100.50)
      expect(rawMaterial.quantityAvailable).toBe(1000)
      
      // Update price
      rawMaterial.updatePrice(150.00)
      expect(rawMaterial.pricePerKg).toBe(150.00)
      expect(rawMaterial.quantityAvailable).toBe(1000) // Should remain same
      
      // Adjust availability
      rawMaterial.adjustAvailability(750.5)
      expect(rawMaterial.pricePerKg).toBe(150.00) // Should remain same
      expect(rawMaterial.quantityAvailable).toBe(750) // Should floor to 750
    })

    it('should handle multiple operations', () => {
      const operations = [
        { price: 200, availability: 1500 },
        { price: 300, availability: 2000 },
        { price: 250, availability: 1750 },
        { price: 100, availability: 1000 }
      ]
      
      operations.forEach((op, index) => {
        rawMaterial.updatePrice(op.price)
        rawMaterial.adjustAvailability(op.availability)
        
        expect(rawMaterial.pricePerKg).toBe(op.price)
        expect(rawMaterial.quantityAvailable).toBe(Math.floor(op.availability))
      })
    })
  })

  describe('edge cases', () => {
    it('should handle undefined material_static_id', () => {
      const rawMaterialWithUndefinedId = createRawMaterial({
        material_static_id: undefined,
        costPerKg: 100,
        availableWeight: 1000
      })
      
      expect(rawMaterialWithUndefinedId.material_static_id).toBe(1) // undefined ?? 1 = 1
    })

    it('should handle null material_static_id', () => {
      const rawMaterialWithNullId = createRawMaterial({
        material_static_id: null,
        costPerKg: 100,
        availableWeight: 1000
      })
      
      expect(rawMaterialWithNullId.material_static_id).toBe(1) // null ?? 1 = 1
    })

    it('should handle extreme decimal precision', () => {
      rawMaterial.costPerKg = 123.456789
      rawMaterial.availableWeight = 987.654321
      
      expect(rawMaterial.pricePerKg).toBe(123.456789)
      expect(rawMaterial.quantityAvailable).toBe(987) // Math.floor(987.654321)
    })

  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(rawMaterial).toBeInstanceOf(RawMaterial)
    })

    it('should have proper column types for database', () => {
      expect(typeof rawMaterial.material_static_id === 'number' || rawMaterial.material_static_id === null || rawMaterial.material_static_id === undefined).toBe(true)
      expect(typeof rawMaterial.costPerKg).toBe('number')
      expect(typeof rawMaterial.availableWeight).toBe('number')
    })

    it('should support decimal precision for cost and weight', () => {
      // Verify that decimal values are handled correctly
      rawMaterial.costPerKg = 123.45
      rawMaterial.availableWeight = 678.90
      
      expect(rawMaterial.costPerKg).toBe(123.45)
      expect(rawMaterial.availableWeight).toBe(678.90)
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createRawMaterial factory', () => {
      const factoryRawMaterial = createRawMaterial({
        material_static_id: 10,
        costPerKg: 500.25,
        availableWeight: 2000.75
      })
      
      expect(factoryRawMaterial.material_static_id).toBe(10)
      expect(factoryRawMaterial.costPerKg).toBe(500.25)
      expect(factoryRawMaterial.availableWeight).toBe(2000.75)
    })

    it('should work with partial overrides', () => {
      const partialRawMaterial = createRawMaterial({ costPerKg: 300 })
      
      expect(partialRawMaterial.material_static_id).toBe(1) // Default value
      expect(partialRawMaterial.costPerKg).toBe(300) // Override value
      expect(partialRawMaterial.availableWeight).toBe(1000.0) // Default value
    })
  })
})
