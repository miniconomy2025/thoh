import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CollectItemUseCase, CollectItemInput } from '../../../src/application/user-cases/collect-item.use-case'
import { Collection } from '../../../src/domain/market/collection.entity'
import { createCollection } from '../../helpers/test-helpers'

// Mock repository
const mockMarketRepo = {
  findCollectionByOrderId: vi.fn(),
  collectFromCollection: vi.fn()
}

describe('CollectItemUseCase', () => {
  let useCase: CollectItemUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    mockMarketRepo.findCollectionByOrderId.mockClear()
    mockMarketRepo.collectFromCollection.mockClear()
    
    useCase = new CollectItemUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should successfully collect items from collection', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 0,
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: 5,
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 5 // 10 - 5
      })

      expect(mockMarketRepo.findCollectionByOrderId).toHaveBeenCalledWith(1)
      expect(mockMarketRepo.collectFromCollection).toHaveBeenCalledWith(1, 5)
    })

    it('should handle partial collection', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 3
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 2, // Already collected 2
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: 5, // 2 + 3
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 5 // 10 - 5
      })
    })

    it('should handle collection not found', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 999,
        collectQuantity: 5
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('No collection found for order 999')
    })

    it('should handle already collected order', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 0,
        collected: true // Already collected
      })

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Order 1 has already been collected')
    })

    it('should handle insufficient quantity for collection', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 8
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 5, // Already collected 5
        collected: false
      })

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Cannot collect 8 items. Would exceed total quantity of 10 (already collected: 5).'
      )
    })

    it('should handle exact quantity collection', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 5, // Already collected 5
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: 10, // 5 + 5
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 0 // 10 - 10
      })
    })

    it('should handle zero quantity collection', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 0
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 0,
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: 0,
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 10 // 10 - 0
      })
    })

    it('should handle negative collect quantity', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: -5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 0,
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: -5, // Negative collection
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert - The implementation doesn't validate negative quantities, it just processes them
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 15 // 10 - (-5) = 15
      })
    })

    it('should handle database errors during find', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      mockMarketRepo.findCollectionByOrderId.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database error')
    })

    it('should handle database errors during collection update', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: 0,
        collected: false
      })

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockRejectedValue(new Error('Update error'))

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Update error')
    })

    it('should handle collection with null amountCollected', async () => {
      // Arrange
      const input: CollectItemInput = {
        orderId: 1,
        collectQuantity: 5
      }

      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Copper',
        quantity: 10,
        amountCollected: null, // Null amount collected
        collected: false
      })

      const updatedCollection = {
        ...collection,
        amountCollected: 5,
        quantity: 10
      }

      mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
      mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result).toEqual({
        orderId: 1,
        quantityRemaining: 5 // 10 - 5
      })
    })

    it('should handle different item types', async () => {
      // Arrange
      const testCases = [
        { itemName: 'Copper', quantity: 100, collectQuantity: 5 },
        { itemName: 'Plastic', quantity: 50, collectQuantity: 3 },
        { itemName: 'Delivery Truck', quantity: 2, collectQuantity: 1 },
        { itemName: 'Recycling Machine', quantity: 1, collectQuantity: 1 }
      ]

      for (const testCase of testCases) {
        const input: CollectItemInput = {
          orderId: 1,
          collectQuantity: testCase.collectQuantity
        }

        const collection = createCollection({
          id: 1,
          orderId: 1,
          itemName: testCase.itemName,
          quantity: testCase.quantity,
          amountCollected: 0,
          collected: false
        })

        const updatedCollection = {
          ...collection,
          amountCollected: testCase.collectQuantity,
          quantity: testCase.quantity
        }

        mockMarketRepo.findCollectionByOrderId.mockResolvedValue(collection)
        mockMarketRepo.collectFromCollection.mockResolvedValue(updatedCollection)

        // Act
        const result = await useCase.execute(input)

        // Assert
        expect(result.orderId).toBe(1)
        expect(result.quantityRemaining).toBe(testCase.quantity - testCase.collectQuantity)
      }
    })
  })
})
