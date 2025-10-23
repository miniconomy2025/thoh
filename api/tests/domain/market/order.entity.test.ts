import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Order } from '../../../src/domain/market/order.entity'
import { createOrder, TEST_DATES } from '../../helpers/test-helpers'

describe('Order Entity', () => {
  let order: Order

  beforeEach(() => {
    order = createOrder()
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(order.id).toBe(1)
      expect(order.itemName).toBe('Test Item')
      expect(order.quantity).toBe(10)
      expect(order.unitPrice).toBe(50.00)
      expect(order.totalPrice).toBe(500.00)
      expect(order.currency).toBe('ZAR')
      expect(order.orderDate).toEqual(new Date('2024-01-01'))
      expect(order.status).toBe('pending')
      expect(order.itemId).toBe(1)
      expect(order.item_type_id).toBe(1)
      expect(order.marketId).toBe(1)
    })

    it('should create order with custom values', () => {
      const customOrder = createOrder({
        id: 42,
        itemName: 'Custom Item',
        quantity: 25,
        unitPrice: 100.50,
        totalPrice: 2512.50,
        currency: 'USD',
        orderDate: TEST_DATES.JANUARY_15_2024,
        status: 'completed',
        itemId: 5,
        item_type_id: 3,
        marketId: 2
      })
      
      expect(customOrder.id).toBe(42)
      expect(customOrder.itemName).toBe('Custom Item')
      expect(customOrder.quantity).toBe(25)
      expect(customOrder.unitPrice).toBe(100.50)
      expect(customOrder.totalPrice).toBe(2512.50)
      expect(customOrder.currency).toBe('USD')
      expect(customOrder.orderDate).toEqual(TEST_DATES.JANUARY_15_2024)
      expect(customOrder.status).toBe('completed')
      expect(customOrder.itemId).toBe(5)
      expect(customOrder.item_type_id).toBe(3)
      expect(customOrder.marketId).toBe(2)
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      order.id = 999
      expect(order.id).toBe(999)
    })

    it('should accept different id values', () => {
      order.id = 0
      expect(order.id).toBe(0)
      
      order.id = 1
      expect(order.id).toBe(1)
    })

  })

  describe('itemName property', () => {
    it('should be mutable', () => {
      order.itemName = 'Updated Item'
      expect(order.itemName).toBe('Updated Item')
    })

    it('should accept different item names', () => {
      const itemNames = ['Machine', 'Truck', 'Raw Material', 'Phone', 'Equipment']
      
      itemNames.forEach(name => {
        order.itemName = name
        expect(order.itemName).toBe(name)
      })
    })

    it('should be a string type', () => {
      expect(typeof order.itemName).toBe('string')
    })

    it('should handle long names', () => {
      const longName = 'Very Long Item Name That Exceeds Normal Length Limits'
      order.itemName = longName
      expect(order.itemName).toBe(longName)
    })
  })

  describe('quantity property', () => {
    it('should be mutable', () => {
      order.quantity = 25
      expect(order.quantity).toBe(25)
    })

    it('should accept different quantity values', () => {
      const quantities = [0, 1, 10, 100, 1000, 0.5, 1.5, 10.25]
      
      quantities.forEach(qty => {
        order.quantity = qty
        expect(order.quantity).toBe(qty)
      })
    })

  })

  describe('unitPrice property', () => {
    it('should be mutable', () => {
      order.unitPrice = 75.50
      expect(order.unitPrice).toBe(75.50)
    })

    it('should accept different unit prices', () => {
      const prices = [0, 0.01, 1, 10.50, 100.99, 1000.00]
      
      prices.forEach(price => {
        order.unitPrice = price
        expect(order.unitPrice).toBe(price)
      })
    })

  })

  describe('totalPrice property', () => {
    it('should be mutable', () => {
      order.totalPrice = 1000.00
      expect(order.totalPrice).toBe(1000.00)
    })

    it('should accept different total prices', () => {
      const prices = [0, 0.01, 1, 10.50, 100.99, 10000.00]
      
      prices.forEach(price => {
        order.totalPrice = price
        expect(order.totalPrice).toBe(price)
      })
    })

  })

  describe('currency property', () => {
    it('should be mutable', () => {
      order.currency = 'USD'
      expect(order.currency).toBe('USD')
    })
    
  })

  describe('orderDate property', () => {
    it('should be mutable', () => {
      const newDate = new Date('2024-02-01')
      order.orderDate = newDate
      expect(order.orderDate).toBe(newDate)
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
        order.orderDate = date
        expect(order.orderDate).toBe(date)
      })
    })

  })

  describe('status property', () => {
    it('should be mutable', () => {
      order.status = 'completed'
      expect(order.status).toBe('completed')
    })

    it('should accept different statuses', () => {
      const statuses = ['pending', 'completed', 'cancelled', 'processing', 'shipped']
      
      statuses.forEach(status => {
        order.status = status
        expect(order.status).toBe(status)
      })
    })

  })

  describe('itemId property', () => {
    it('should be mutable', () => {
      order.itemId = 42
      expect(order.itemId).toBe(42)
    })

    it('should accept different item IDs', () => {
      const itemIds = [0, 1, 10, 100, null, undefined]
      
      itemIds.forEach(id => {
        order.itemId = id
        expect(order.itemId).toBe(id)
      })
    })

    it('should handle null and undefined', () => {
      order.itemId = null
      expect(order.itemId).toBeNull()
      
      order.itemId = undefined
      expect(order.itemId).toBeUndefined()
    })
  })

  describe('item_type_id property', () => {
    it('should be mutable', () => {
      order.item_type_id = 5
      expect(order.item_type_id).toBe(5)
    })

    it('should accept different type IDs', () => {
      const typeIds = [0, 1, 10, 100, null, undefined]
      
      typeIds.forEach(id => {
        order.item_type_id = id
        expect(order.item_type_id).toBe(id)
      })
    })

    it('should handle null and undefined', () => {
      order.item_type_id = null
      expect(order.item_type_id).toBeNull()
      
      order.item_type_id = undefined
      expect(order.item_type_id).toBeUndefined()
    })
  })

  describe('marketId property', () => {
    it('should be mutable', () => {
      order.marketId = 3
      expect(order.marketId).toBe(3)
    })

    it('should accept different market IDs', () => {
      const marketIds = [0, 1, 10, 100, null, undefined]
      
      marketIds.forEach(id => {
        order.marketId = id
        expect(order.marketId).toBe(id)
      })
    })

    it('should handle null and undefined', () => {
      order.marketId = null
      expect(order.marketId).toBeNull()
      
      order.marketId = undefined
      expect(order.marketId).toBeUndefined()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete order lifecycle', () => {
      // Initial state
      expect(order.status).toBe('pending')
      expect(order.itemName).toBe('Test Item')
      
      // Process order
      order.status = 'processing'
      expect(order.status).toBe('processing')
      
      // Complete order
      order.status = 'completed'
      expect(order.status).toBe('completed')
    })

    it('should handle order with all properties updated', () => {
      order.id = 2
      order.itemName = 'Machine'
      order.quantity = 5
      order.unitPrice = 1000.00
      order.totalPrice = 5000.00
      order.currency = 'USD'
      order.orderDate = TEST_DATES.FEBRUARY_1_2024
      order.status = 'completed'
      order.itemId = 10
      order.item_type_id = 2
      order.marketId = 3
      
      expect(order.id).toBe(2)
      expect(order.itemName).toBe('Machine')
      expect(order.quantity).toBe(5)
      expect(order.unitPrice).toBe(1000.00)
      expect(order.totalPrice).toBe(5000.00)
      expect(order.currency).toBe('USD')
      expect(order.orderDate).toEqual(TEST_DATES.FEBRUARY_1_2024)
      expect(order.status).toBe('completed')
      expect(order.itemId).toBe(10)
      expect(order.item_type_id).toBe(2)
      expect(order.marketId).toBe(3)
    })

    it('should handle multiple order updates', () => {
      const updates = [
        { status: 'processing', quantity: 15 },
        { status: 'shipped', quantity: 20 },
        { status: 'completed', quantity: 20 }
      ]
      
      updates.forEach(update => {
        order.status = update.status
        order.quantity = update.quantity
        
        expect(order.status).toBe(update.status)
        expect(order.quantity).toBe(update.quantity)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle order with undefined id initially', () => {
      const orderWithoutId = new Order()
      orderWithoutId.itemName = 'Test Item'
      orderWithoutId.quantity = 10
      orderWithoutId.unitPrice = 50.00
      orderWithoutId.totalPrice = 500.00
      orderWithoutId.currency = 'ZAR'
      orderWithoutId.orderDate = new Date('2024-01-01')
      orderWithoutId.status = 'pending'
      
      expect(orderWithoutId.id).toBeUndefined()
      expect(orderWithoutId.itemName).toBe('Test Item')
    })

    it('should handle extreme decimal precision', () => {
      order.unitPrice = 123.456789
      order.totalPrice = 987.654321
      order.quantity = 1.234567
      
      expect(order.unitPrice).toBe(123.456789)
      expect(order.totalPrice).toBe(987.654321)
      expect(order.quantity).toBe(1.234567)
    })

    it('should handle very large numbers', () => {
      order.quantity = 999999
      order.unitPrice = 999999.99
      order.totalPrice = 999999999.99
      
      expect(order.quantity).toBe(999999)
      expect(order.unitPrice).toBe(999999.99)
      expect(order.totalPrice).toBe(999999999.99)
    })

  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(order).toBeInstanceOf(Order)
    })

    it('should have proper column types for database', () => {
      expect(typeof order.id).toBe('number')
      expect(typeof order.itemName).toBe('string')
      expect(typeof order.quantity).toBe('number')
      expect(typeof order.unitPrice).toBe('number')
      expect(typeof order.totalPrice).toBe('number')
      expect(typeof order.currency).toBe('string')
      expect(order.orderDate).toBeInstanceOf(Date)
      expect(typeof order.status).toBe('string')
      expect(typeof order.itemId === 'number' || order.itemId === null || order.itemId === undefined).toBe(true)
      expect(typeof order.item_type_id === 'number' || order.item_type_id === null || order.item_type_id === undefined).toBe(true)
      expect(typeof order.marketId === 'number' || order.marketId === null || order.marketId === undefined).toBe(true)
    })

    it('should support decimal precision for prices and quantity', () => {
      order.unitPrice = 123.45
      order.totalPrice = 678.90
      order.quantity = 1.23
      
      expect(order.unitPrice).toBe(123.45)
      expect(order.totalPrice).toBe(678.90)
      expect(order.quantity).toBe(1.23)
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createOrder factory', () => {
      const factoryOrder = createOrder({
        id: 5,
        itemName: 'Factory Item',
        quantity: 15,
        unitPrice: 75.50,
        totalPrice: 1132.50,
        currency: 'EUR',
        status: 'processing'
      })
      
      expect(factoryOrder.id).toBe(5)
      expect(factoryOrder.itemName).toBe('Factory Item')
      expect(factoryOrder.quantity).toBe(15)
      expect(factoryOrder.unitPrice).toBe(75.50)
      expect(factoryOrder.totalPrice).toBe(1132.50)
      expect(factoryOrder.currency).toBe('EUR')
      expect(factoryOrder.status).toBe('processing')
    })

    it('should work with partial overrides', () => {
      const partialOrder = createOrder({ itemName: 'Partial Override', status: 'completed' })
      
      expect(partialOrder.id).toBe(1) // Default value
      expect(partialOrder.itemName).toBe('Partial Override') // Override value
      expect(partialOrder.status).toBe('completed') // Override value
      expect(partialOrder.quantity).toBe(10) // Default value
    })
  })
})
