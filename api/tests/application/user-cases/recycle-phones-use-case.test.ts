import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock modules before any imports
vi.mock('../../../src/infrastructure/persistence/postgres/recycle.repository', () => ({
  RecycleRepository: vi.fn()
}))

vi.mock('../../../src/domain/shared/data-source', () => ({
  AppDataSource: {
    manager: {
      remove: vi.fn()
    }
  }
}))

import { RecyclePhonesUseCase } from '../../../src/application/user-cases/recycle-phones.use-case'
import { createRecycle, createPhone, createPhoneStatic } from '../../helpers/test-helpers'
import { RecycleRepository } from '../../../src/infrastructure/persistence/postgres/recycle.repository'
import { AppDataSource } from '../../../src/domain/shared/data-source'

describe('RecyclePhonesUseCase', () => {
  let useCase: RecyclePhonesUseCase
  let mockFindAll: ReturnType<typeof vi.fn>
  let mockRemove: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create fresh mock functions
    mockFindAll = vi.fn()
    mockRemove = vi.fn()
    
    // Mock the repository constructor to return our mock
    const MockedRecycleRepository = vi.mocked(RecycleRepository)
    MockedRecycleRepository.mockImplementation(() => ({
      findAll: mockFindAll
    }) as any)
    
    // Mock the AppDataSource
    const MockedAppDataSource = vi.mocked(AppDataSource)
    MockedAppDataSource.manager.remove = mockRemove
    
    useCase = new RecyclePhonesUseCase()
  })

  describe('listGroupedByModel', () => {
    it('should group phones by model name', async () => {
      // Arrange
      const ePhoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const cosmosModel = createPhoneStatic({ id: 2, name: 'Cosmos' })
      
      const recycledPhones = [
        createRecycle({ phone: createPhone({ id: 1, model: ePhoneModel }) }),
        createRecycle({ phone: createPhone({ id: 2, model: ePhoneModel }) }),
        createRecycle({ phone: createPhone({ id: 3, model: cosmosModel }) }),
        createRecycle({ phone: createPhone({ id: 4, model: ePhoneModel }) })
      ]

      mockFindAll.mockResolvedValue(recycledPhones)

      // Act
      const result = await useCase.listGroupedByModel()

      // Assert
      expect(result).toHaveLength(2)
      
      const ePhoneGroup = result.find(g => g.modelName === 'ePhone')
      const cosmosGroup = result.find(g => g.modelName === 'Cosmos')
      
      expect(ePhoneGroup).toEqual({
        modelId: 1,
        modelName: 'ePhone',
        quantity: 3
      })
      
      expect(cosmosGroup).toEqual({
        modelId: 2,
        modelName: 'Cosmos',
        quantity: 1
      })
    })

    it('should handle empty list', async () => {
      // Arrange
      mockFindAll.mockResolvedValue([])

      // Act
      const result = await useCase.listGroupedByModel()

      // Assert
      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      // Arrange
      mockFindAll.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.listGroupedByModel()).rejects.toThrow('Database error')
    })
  })

  describe('collectByModelName', () => {
    it('should collect phones by model name', async () => {
      // Arrange
      const ePhoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const cosmosModel = createPhoneStatic({ id: 2, name: 'Cosmos' })
      
      const recycledPhones = [
        createRecycle({ id: 1, phone: createPhone({ id: 1, model: ePhoneModel }) }),
        createRecycle({ id: 2, phone: createPhone({ id: 2, model: ePhoneModel }) }),
        createRecycle({ id: 3, phone: createPhone({ id: 3, model: cosmosModel }) }),
        createRecycle({ id: 4, phone: createPhone({ id: 4, model: ePhoneModel }) })
      ]

      mockFindAll.mockResolvedValue(recycledPhones)
      mockRemove.mockResolvedValue({})

      // Act
      const result = await useCase.collectByModelName('ePhone', 2)

      // Assert
      expect(result).toEqual({
        collected: 2,
        remaining: 1
      })
      
      expect(mockRemove).toHaveBeenCalledTimes(2)
    })

    it('should handle empty list', async () => {
      // Arrange
      mockFindAll.mockResolvedValue([])

      // Act
      const result = await useCase.collectByModelName('ePhone', 2)

      // Assert
      expect(result).toEqual({
        collected: 0,
        remaining: 0
      })
    })

    it('should handle database errors', async () => {
      // Arrange
      mockFindAll.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.collectByModelName('ePhone', 2)).rejects.toThrow('Database error')
    })
  })
})