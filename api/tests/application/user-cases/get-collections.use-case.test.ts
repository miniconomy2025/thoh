import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCollectionsUseCase } from '../../../src/application/user-cases/get-collections.use-case'
import { Collection } from '../../../src/domain/market/collection.entity'
import { createCollection } from '../../helpers/test-helpers'

// Mock repository
const mockMarketRepo = {
  getAllCollections: vi.fn()
}

describe('GetCollectionsUseCase', () => {
  let useCase: GetCollectionsUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetCollectionsUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should return empty array when no collections exist', async () => {
      // Arrange
      mockMarketRepo.getAllCollections.mockResolvedValue([])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([])
      expect(mockMarketRepo.getAllCollections).toHaveBeenCalled()
    })

    it('should return formatted collections when collections exist', async () => {
      // Arrange
      const collection1 = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Test Machine',
        itemId: 1,
        quantity: 2,
        amountCollected: 0,
        orderDate: new Date('2024-01-01'),
        collected: false,
        collectionDate: null
      })

      const collection2 = createCollection({
        id: 2,
        orderId: 2,
        itemName: 'Test Truck',
        itemId: 2,
        quantity: 1,
        amountCollected: 1,
        orderDate: new Date('2024-01-02'),
        collected: true,
        collectionDate: new Date('2024-01-03')
      })

      mockMarketRepo.getAllCollections.mockResolvedValue([collection1, collection2])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 1,
        orderId: 1,
        itemName: 'Test Machine',
        itemId: 1,
        quantity: 2,
        amountCollected: 0,
        orderDate: new Date('2024-01-01'),
        collected: false,
        collectionDate: null
      })
      expect(result[1]).toMatchObject({
        id: 2,
        orderId: 2,
        itemName: 'Test Truck',
        itemId: 2,
        quantity: 1,
        amountCollected: 1,
        orderDate: new Date('2024-01-02'),
        collected: true,
        collectionDate: new Date('2024-01-03')
      })
    })

    it('should convert quantity and amountCollected to numbers', async () => {
      // Arrange
      const collection = createCollection({
        id: 1,
        orderId: 1,
        itemName: 'Test Item',
        itemId: 1,
        quantity: '5' as any, // String quantity
        amountCollected: '2' as any, // String amountCollected
        orderDate: new Date('2024-01-01'),
        collected: false,
        collectionDate: null
      })

      mockMarketRepo.getAllCollections.mockResolvedValue([collection])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(5) // Should be converted to number
      expect(result[0].amountCollected).toBe(2) // Should be converted to number
    })

    it('should handle undefined quantity and amountCollected', async () => {
      // Arrange
      const collection = new Collection()
      collection.id = 1
      collection.orderId = 1
      collection.itemName = 'Test Item'
      collection.itemId = 1
      collection.quantity = undefined as any
      collection.amountCollected = undefined as any
      collection.orderDate = new Date('2024-01-01')
      collection.collected = false
      collection.collectionDate = null

      mockMarketRepo.getAllCollections.mockResolvedValue([collection])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBeUndefined()
      expect(result[0].amountCollected).toBeUndefined()
    })
  })
})
