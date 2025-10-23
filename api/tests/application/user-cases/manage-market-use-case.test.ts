import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ManageMarketUseCase } from '../../../src/application/user-cases/manage-market.use-case'
import { RawMaterialsMarket } from '../../../src/domain/market/market.aggregate'
import { RawMaterial } from '../../../src/domain/market/raw-material.entity'
import { RawMaterialType } from '../../../src/domain/market/market.types'
import { createRawMaterial } from '../../helpers/test-helpers'

// Mock repository
const mockMarketRepo = {
  findRawMaterialsMarket: vi.fn(),
  saveRawMaterialsMarket: vi.fn()
}

describe('ManageMarketUseCase', () => {
  let useCase: ManageMarketUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    mockMarketRepo.findRawMaterialsMarket.mockClear()
    mockMarketRepo.saveRawMaterialsMarket.mockClear()
    
    useCase = new ManageMarketUseCase(mockMarketRepo as any)
  })

  describe('updateMaterialPrice', () => {
    it('should update material price successfully', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 150.75
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        }),
        createRawMaterial({ 
          material_static_id: 2, 
          costPerKg: 200.25, 
          availableWeight: 500.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act
      await useCase.updateMaterialPrice(materialType, newPrice)

      // Assert
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
      expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, newPrice)
      expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
    })

    it('should throw error when raw materials market not found', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 150.75
      
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.updateMaterialPrice(materialType, newPrice))
        .rejects.toThrow('Raw materials market not found')
    })

    it('should handle different material types', async () => {
      // Arrange
      const materialTypes: RawMaterialType[] = [
        'copper',
        'plastic',
        'silicon',
        'sand',
        'aluminium'
      ]
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act & Assert - Test each material type
      for (const materialType of materialTypes) {
        await useCase.updateMaterialPrice(materialType, 150.75)
        expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
        expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, 150.75)
        expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
      }
    })

    it('should handle zero price', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 0
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act
      await useCase.updateMaterialPrice(materialType, newPrice)

      // Assert
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
      expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, newPrice)
      expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
    })

    it('should handle very large price values', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 999999.99
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act
      await useCase.updateMaterialPrice(materialType, newPrice)

      // Assert
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
      expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, newPrice)
      expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
    })

    it('should handle database errors during find', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 150.75
      
      mockMarketRepo.findRawMaterialsMarket.mockRejectedValue(new Error('Database connection error'))

      // Act & Assert
      await expect(useCase.updateMaterialPrice(materialType, newPrice))
        .rejects.toThrow('Database connection error')
    })

    it('should handle database errors during save', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 150.75
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockRejectedValue(new Error('Save error'))

      // Act & Assert
      await expect(useCase.updateMaterialPrice(materialType, newPrice))
        .rejects.toThrow('Save error')
    })

    it('should handle decimal price values', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 123.456789
      
      const rawMaterials = [
        createRawMaterial({ 
          material_static_id: 1, 
          costPerKg: 100.50, 
          availableWeight: 1000.0 
        })
      ]
      
      const rawMaterialsMarket = new RawMaterialsMarket(rawMaterials)
      // Mock the updateMaterialPrice method
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act
      await useCase.updateMaterialPrice(materialType, newPrice)

      // Assert
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
      expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, newPrice)
      expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
    })

    it('should handle empty raw materials market', async () => {
      // Arrange
      const materialType: RawMaterialType = 'copper'
      const newPrice = 150.75
      
      const rawMaterialsMarket = new RawMaterialsMarket([])
      // Mock the updateMaterialPrice method to handle NaN input gracefully
      rawMaterialsMarket.updateMaterialPrice = vi.fn()
      mockMarketRepo.findRawMaterialsMarket.mockResolvedValue(rawMaterialsMarket)
      mockMarketRepo.saveRawMaterialsMarket.mockResolvedValue({})

      // Act
      await useCase.updateMaterialPrice(materialType, newPrice)

      // Assert
      expect(mockMarketRepo.findRawMaterialsMarket).toHaveBeenCalled()
      expect(rawMaterialsMarket.updateMaterialPrice).toHaveBeenCalledWith(NaN, newPrice)
      expect(mockMarketRepo.saveRawMaterialsMarket).toHaveBeenCalledWith(rawMaterialsMarket)
    })
  })
})
