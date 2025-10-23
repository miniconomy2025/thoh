import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetRawMaterialsUseCase } from '../../../src/application/user-cases/get-raw-materials.use-case'
import { RawMaterial } from '../../../src/domain/market/raw-material.entity'
import { createRawMaterial } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findRawMaterialsMarket: vi.fn()
}

const mockMaterialStaticRepo = {
  findAll: vi.fn()
}

// Mock the static repository
vi.mock('../../../src/infrastructure/persistence/postgres/material-static.repository', () => ({
  MaterialStaticRepository: vi.fn().mockImplementation(() => mockMaterialStaticRepo)
}))

describe('GetRawMaterialsUseCase', () => {
  let useCase: GetRawMaterialsUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetRawMaterialsUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should return empty array when no raw materials available', async () => {
      // Arrange
      const mockMarket = {
        getRawMaterials: vi.fn().mockReturnValue([])
      }
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(mockMarket)

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([])
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
    })

    it('should throw error when raw materials market not found', async () => {
      // Arrange
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Raw materials market not found')
    })

    it('should return raw materials with static data', async () => {
      // Arrange
      const rawMaterial = createRawMaterial({ 
        id: 1, 
        material_static_id: 1, 
        costPerKg: 50.0,
        availableWeight: 100.0
      })
      
      const mockMarket = {
        getRawMaterials: vi.fn().mockReturnValue([rawMaterial])
      }
      
      const mockStaticData = {
        id: 1,
        name: 'Copper',
        description: 'Raw copper material'
      }
      
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(mockMarket)
      mockMaterialStaticRepo.findAll.mockResolvedValue([mockStaticData])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        rawMaterialName: 'Copper',
        description: 'Raw copper material',
        pricePerKg: 50.0,
        quantityAvailable: 100
      })
    })

    it('should handle raw materials without static data', async () => {
      // Arrange
      const rawMaterial = createRawMaterial({ 
        id: 1, 
        material_static_id: undefined, // No static ID
        costPerKg: 50.0,
        availableWeight: 100.0
      })
      
      const mockMarket = {
        getRawMaterials: vi.fn().mockReturnValue([rawMaterial])
      }
      
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(mockMarket)
      mockMaterialStaticRepo.findAll.mockResolvedValue([]) // No static data

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([]) // Should be empty since no static data
    })

    it('should handle raw materials with null static ID', async () => {
      // Arrange
      const rawMaterial = createRawMaterial({ 
        id: 1, 
        material_static_id: null, // Null static ID
        costPerKg: 50.0,
        availableWeight: 100.0
      })
      
      const mockMarket = {
        getRawMaterials: vi.fn().mockReturnValue([rawMaterial])
      }
      
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(mockMarket)
      mockMaterialStaticRepo.findAll.mockResolvedValue([]) // No static data

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result).toEqual([]) // Should be empty since no static data
    })
  })
})
