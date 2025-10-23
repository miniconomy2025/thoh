import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Collection } from '../../../src/domain/market/collection.entity'
import { createCollection, TEST_DATES } from '../../helpers/test-helpers'

describe('Collection Entity', () => {
  let collection: Collection

  beforeEach(() => {
    collection = createCollection()
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(collection.id).toBe(1)
      expect(collection.orderId).toBe(1)
      expect(collection.itemName).toBe('Test Item')
      expect(collection.itemId).toBe(1)
      expect(collection.quantity).toBe(10)
      expect(collection.amountCollected).toBe(0)
      expect(collection.orderDate).toEqual(new Date('2024-01-01'))
      expect(collection.collected).toBe(false)
      expect(collection.collectionDate).toBeNull()
    })

    it('should create collection with custom values', () => {
      const customCollection = createCollection({
        id: 42,
        orderId: 5,
        itemName: 'Custom Item',
        itemId: 10,
        quantity: 25,
        amountCollected: 15,
        orderDate: TEST_DATES.JANUARY_15_2024,
        collected: true,
        collectionDate: TEST_DATES.FEBRUARY_1_2024
      })
      
      expect(customCollection.id).toBe(42)
      expect(customCollection.orderId).toBe(5)
      expect(customCollection.itemName).toBe('Custom Item')
      expect(customCollection.itemId).toBe(10)
      expect(customCollection.quantity).toBe(25)
      expect(customCollection.amountCollected).toBe(15)
      expect(customCollection.orderDate).toEqual(TEST_DATES.JANUARY_15_2024)
      expect(customCollection.collected).toBe(true)
      expect(customCollection.collectionDate).toEqual(TEST_DATES.FEBRUARY_1_2024)
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      collection.id = 999
      expect(collection.id).toBe(999)
    })

    it('should accept different id values', () => {
      collection.id = 0
      expect(collection.id).toBe(0)
      
      collection.id = 1
      expect(collection.id).toBe(1)
    })

  })

  describe('orderId property', () => {
    it('should be mutable', () => {
      collection.orderId = 42
      expect(collection.orderId).toBe(42)
    })

    it('should accept different order IDs', () => {
      const orderIds = [0, 1, 10, 100, 1000]
      
      orderIds.forEach(id => {
        collection.orderId = id
        expect(collection.orderId).toBe(id)
      })
    })

  })

  describe('itemName property', () => {
    it('should be mutable', () => {
      collection.itemName = 'Updated Item'
      expect(collection.itemName).toBe('Updated Item')
    })

    it('should accept different item names', () => {
      const itemNames = ['Machine', 'Truck', 'Raw Material', 'Phone', 'Equipment']
      
      itemNames.forEach(name => {
        collection.itemName = name
        expect(collection.itemName).toBe(name)
      })
    })

  })

  describe('itemId property', () => {
    it('should be mutable', () => {
      collection.itemId = 42
      expect(collection.itemId).toBe(42)
    })

    it('should accept different item IDs', () => {
      const itemIds = [0, 1, 10, 100, 1000]
      
      itemIds.forEach(id => {
        collection.itemId = id
        expect(collection.itemId).toBe(id)
      })
    })

  })

  describe('quantity property', () => {
    it('should be mutable', () => {
      collection.quantity = 25
      expect(collection.quantity).toBe(25)
    })

    it('should accept different quantity values', () => {
      const quantities = [0, 1, 10, 100, 1000, 0.5, 1.5, 10.25]
      
      quantities.forEach(qty => {
        collection.quantity = qty
        expect(collection.quantity).toBe(qty)
      })
    })

  })

  describe('amountCollected property', () => {
    it('should be mutable', () => {
      collection.amountCollected = 15
      expect(collection.amountCollected).toBe(15)
    })

    it('should accept different collected amounts', () => {
      const amounts = [0, 1, 10, 100, 1000, 0.5, 1.5, 10.25]
      
      amounts.forEach(amount => {
        collection.amountCollected = amount
        expect(collection.amountCollected).toBe(amount)
      })
    })

  })

  describe('orderDate property', () => {
    it('should be mutable', () => {
      const newDate = new Date('2024-02-01')
      collection.orderDate = newDate
      expect(collection.orderDate).toBe(newDate)
    })

    it('should accept different dates', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2025-01-01')
      ]
      
      dates.forEach(date => {
        collection.orderDate = date
        expect(collection.orderDate).toBe(date)
      })
    })

  })

  describe('collected property', () => {
    it('should be mutable', () => {
      collection.collected = true
      expect(collection.collected).toBe(true)
    })

    it('should accept boolean values', () => {
      collection.collected = true
      expect(collection.collected).toBe(true)
      
      collection.collected = false
      expect(collection.collected).toBe(false)
    })

  })

  describe('collectionDate property', () => {
    it('should be mutable', () => {
      const newDate = new Date('2024-02-01')
      collection.collectionDate = newDate
      expect(collection.collectionDate).toBe(newDate)
    })

    it('should accept different dates', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
        null,
        undefined
      ]
      
      dates.forEach(date => {
        collection.collectionDate = date
        expect(collection.collectionDate).toBe(date)
      })
    })

    it('should handle null and undefined', () => {
      collection.collectionDate = null
      expect(collection.collectionDate).toBeNull()
      
      collection.collectionDate = undefined
      expect(collection.collectionDate).toBeUndefined()
    })

    it('should be a Date type when set', () => {
      const testDate = new Date('2024-02-01')
      collection.collectionDate = testDate
      expect(collection.collectionDate).toBeInstanceOf(Date)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete collection lifecycle', () => {
      // Initial state - not collected
      expect(collection.collected).toBe(false)
      expect(collection.amountCollected).toBe(0)
      expect(collection.collectionDate).toBeNull()
      
      // Partial collection
      collection.amountCollected = 5
      expect(collection.amountCollected).toBe(5)
      expect(collection.collected).toBe(false) // Still not fully collected
      
      // Complete collection
      collection.amountCollected = 10
      collection.collected = true
      collection.collectionDate = new Date('2024-02-01')
      
      expect(collection.amountCollected).toBe(10)
      expect(collection.collected).toBe(true)
      expect(collection.collectionDate).toEqual(new Date('2024-02-01'))
    })

    it('should handle collection with all properties updated', () => {
      collection.id = 2
      collection.orderId = 10
      collection.itemName = 'Machine'
      collection.itemId = 5
      collection.quantity = 20
      collection.amountCollected = 20
      collection.orderDate = TEST_DATES.JANUARY_15_2024
      collection.collected = true
      collection.collectionDate = TEST_DATES.FEBRUARY_1_2024
      
      expect(collection.id).toBe(2)
      expect(collection.orderId).toBe(10)
      expect(collection.itemName).toBe('Machine')
      expect(collection.itemId).toBe(5)
      expect(collection.quantity).toBe(20)
      expect(collection.amountCollected).toBe(20)
      expect(collection.orderDate).toEqual(TEST_DATES.JANUARY_15_2024)
      expect(collection.collected).toBe(true)
      expect(collection.collectionDate).toEqual(TEST_DATES.FEBRUARY_1_2024)
    })

    it('should handle multiple collection updates', () => {
      const updates = [
        { amountCollected: 5, collected: false },
        { amountCollected: 10, collected: true },
        { amountCollected: 15, collected: true }
      ]
      
      updates.forEach(update => {
        collection.amountCollected = update.amountCollected
        collection.collected = update.collected
        
        expect(collection.amountCollected).toBe(update.amountCollected)
        expect(collection.collected).toBe(update.collected)
      })
    })

    it('should handle collection date updates', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-15'),
        new Date('2024-02-01'),
        null,
        new Date('2024-02-15')
      ]
      
      dates.forEach(date => {
        collection.collectionDate = date
        expect(collection.collectionDate).toBe(date)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle collection with undefined id initially', () => {
      const collectionWithoutId = new Collection()
      collectionWithoutId.orderId = 1
      collectionWithoutId.itemName = 'Test Item'
      collectionWithoutId.itemId = 1
      collectionWithoutId.quantity = 10
      collectionWithoutId.amountCollected = 0
      collectionWithoutId.orderDate = new Date('2024-01-01')
      collectionWithoutId.collected = false
      
      expect(collectionWithoutId.id).toBeUndefined()
      expect(collectionWithoutId.orderId).toBe(1)
      expect(collectionWithoutId.itemName).toBe('Test Item')
    })

    it('should handle extreme decimal precision', () => {
      collection.quantity = 123.456789
      collection.amountCollected = 987.654321
      
      expect(collection.quantity).toBe(123.456789)
      expect(collection.amountCollected).toBe(987.654321)
    })

    it('should handle very large numbers', () => {
      collection.quantity = 999999
      collection.amountCollected = 999999
      collection.orderId = 999999
      collection.itemId = 999999
      
      expect(collection.quantity).toBe(999999)
      expect(collection.amountCollected).toBe(999999)
      expect(collection.orderId).toBe(999999)
      expect(collection.itemId).toBe(999999)
    })

    it('should handle collection date before order date', () => {
      collection.orderDate = new Date('2024-02-01')
      collection.collectionDate = new Date('2024-01-01') // Before order date
      
      expect(collection.orderDate).toEqual(new Date('2024-02-01'))
      expect(collection.collectionDate).toEqual(new Date('2024-01-01'))
    })
  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(collection).toBeInstanceOf(Collection)
    })

    it('should have proper column types for database', () => {
      expect(typeof collection.id).toBe('number')
      expect(typeof collection.orderId).toBe('number')
      expect(typeof collection.itemName).toBe('string')
      expect(typeof collection.itemId).toBe('number')
      expect(typeof collection.quantity).toBe('number')
      expect(typeof collection.amountCollected).toBe('number')
      expect(collection.orderDate).toBeInstanceOf(Date)
      expect(typeof collection.collected).toBe('boolean')
      expect(collection.collectionDate === null || collection.collectionDate === undefined || collection.collectionDate instanceof Date).toBe(true)
    })

    it('should support decimal precision for quantity and amountCollected', () => {
      collection.quantity = 123.45
      collection.amountCollected = 678.90
      
      expect(collection.quantity).toBe(123.45)
      expect(collection.amountCollected).toBe(678.90)
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createCollection factory', () => {
      const factoryCollection = createCollection({
        id: 5,
        orderId: 10,
        itemName: 'Factory Item',
        itemId: 15,
        quantity: 20,
        amountCollected: 15,
        collected: true,
        collectionDate: TEST_DATES.FEBRUARY_1_2024
      })
      
      expect(factoryCollection.id).toBe(5)
      expect(factoryCollection.orderId).toBe(10)
      expect(factoryCollection.itemName).toBe('Factory Item')
      expect(factoryCollection.itemId).toBe(15)
      expect(factoryCollection.quantity).toBe(20)
      expect(factoryCollection.amountCollected).toBe(15)
      expect(factoryCollection.collected).toBe(true)
      expect(factoryCollection.collectionDate).toEqual(TEST_DATES.FEBRUARY_1_2024)
    })

    it('should work with partial overrides', () => {
      const partialCollection = createCollection({ 
        itemName: 'Partial Override', 
        collected: true,
        amountCollected: 5
      })
      
      expect(partialCollection.id).toBe(1) // Default value
      expect(partialCollection.itemName).toBe('Partial Override') // Override value
      expect(partialCollection.collected).toBe(true) // Override value
      expect(partialCollection.amountCollected).toBe(5) // Override value
      expect(partialCollection.quantity).toBe(10) // Default value
    })
  })
})
