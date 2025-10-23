import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BreakPhonesUseCase } from '../../../src/application/user-cases/break-phones.use-case'
import { Person } from '../../../src/domain/population/person.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { Recycle } from '../../../src/domain/population/recycle.entity'
import { createPerson, createPhone, createPhoneStatic } from '../../helpers/test-helpers'

// Mock repositories
const mockPersonRepo = {
  find: vi.fn(),
  updatePerson: vi.fn()
}

const mockRecycleRepo = {
  save: vi.fn()
}

vi.mock('../../../src/infrastructure/persistence/postgres/person.repository', () => ({
  PersonRepository: {
    getRepo: () => mockPersonRepo
  }
}))

vi.mock('../../../src/infrastructure/persistence/postgres/recycle.repository', () => ({
  RecycleRepository: vi.fn().mockImplementation(() => mockRecycleRepo)
}))

describe('BreakPhonesUseCase', () => {
  let useCase: BreakPhonesUseCase
  let mockPopulationRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPersonRepo.find.mockClear()
    mockPersonRepo.updatePerson.mockClear()
    mockRecycleRepo.save.mockClear()
    
    mockPopulationRepo = {
      updatePerson: vi.fn()
    }
    
    useCase = new BreakPhonesUseCase(mockPopulationRepo)
  })

  describe('execute', () => {
    it('should break phones for up to 10 people with phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const peopleWithPhones = Array.from({ length: 15 }, (_, i) => 
        createPerson({ 
          id: i + 1, 
          phone: createPhone({ id: i + 1, model: phoneModel, isBroken: false })
        })
      )

      mockPersonRepo.find.mockResolvedValue(peopleWithPhones)
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(10) // Only 10 phones should be broken
      expect(mockPopulationRepo.updatePerson).toHaveBeenCalledTimes(10)
      
      // Check that phones are marked as broken and removed from people
      for (let i = 0; i < 10; i++) {
        const updateCall = mockPopulationRepo.updatePerson.mock.calls[i][0]
        expect(updateCall.phone).toBeNull()
      }
    })

    it('should handle people without phones gracefully', async () => {
      // Arrange
      const peopleWithoutPhones = Array.from({ length: 5 }, (_, i) => 
        createPerson({ id: i + 1, phone: null })
      )

      mockPersonRepo.find.mockResolvedValue(peopleWithoutPhones)

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).not.toHaveBeenCalled()
      expect(mockPopulationRepo.updatePerson).not.toHaveBeenCalled()
    })

    it('should handle mixed people with and without phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const people = [
        createPerson({ id: 1, phone: null }), // No phone
        createPerson({ id: 2, phone: createPhone({ id: 2, model: phoneModel, isBroken: false }) }), // Has phone
        createPerson({ id: 3, phone: null }), // No phone
        createPerson({ id: 4, phone: createPhone({ id: 4, model: phoneModel, isBroken: false }) }), // Has phone
        createPerson({ id: 5, phone: createPhone({ id: 5, model: phoneModel, isBroken: false }) })  // Has phone
      ]

      mockPersonRepo.find.mockResolvedValue(people)
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(3) // Only 3 people have phones
      expect(mockPopulationRepo.updatePerson).toHaveBeenCalledTimes(3)
    })

    it('should create recycle records for broken phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel, isBroken: false })
      const person = createPerson({ id: 1, phone })

      mockPersonRepo.find.mockResolvedValue([person])
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: phone
        })
      )
    })

    it('should shuffle people before selecting phones to break', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const peopleWithPhones = Array.from({ length: 20 }, (_, i) => 
        createPerson({ 
          id: i + 1, 
          phone: createPhone({ id: i + 1, model: phoneModel, isBroken: false })
        })
      )

      mockPersonRepo.find.mockResolvedValue(peopleWithPhones)
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Mock Math.random to control shuffling
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(10)
      // The exact phones selected will depend on the shuffling algorithm
      // We just verify that exactly 10 phones were processed
    })

    it('should handle empty people list', async () => {
      // Arrange
      mockPersonRepo.find.mockResolvedValue([])

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).not.toHaveBeenCalled()
      expect(mockPopulationRepo.updatePerson).not.toHaveBeenCalled()
    })

    it('should handle database errors during save', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        phone: createPhone({ id: 1, model: phoneModel, isBroken: false })
      })

      mockPersonRepo.find.mockResolvedValue([person])
      mockRecycleRepo.save.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database error')
    })

    it('should handle database errors during person update', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        phone: createPhone({ id: 1, model: phoneModel, isBroken: false })
      })

      mockPersonRepo.find.mockResolvedValue([person])
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockRejectedValue(new Error('Update error'))

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Update error')
    })

    it('should handle people with already broken phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const people = [
        createPerson({ 
          id: 1, 
          phone: createPhone({ id: 1, model: phoneModel, isBroken: true }) // Already broken
        }),
        createPerson({ 
          id: 2, 
          phone: createPhone({ id: 2, model: phoneModel, isBroken: false }) // Not broken
        })
      ]

      mockPersonRepo.find.mockResolvedValue(people)
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      // Both phones should be processed (broken phones can still be recycled)
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(2)
      expect(mockPopulationRepo.updatePerson).toHaveBeenCalledTimes(2)
    })

    it('should limit to exactly 10 phones even with more people', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const peopleWithPhones = Array.from({ length: 25 }, (_, i) => 
        createPerson({ 
          id: i + 1, 
          phone: createPhone({ id: i + 1, model: phoneModel, isBroken: false })
        })
      )

      mockPersonRepo.find.mockResolvedValue(peopleWithPhones)
      mockRecycleRepo.save.mockResolvedValue({})
      mockPopulationRepo.updatePerson.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(10) // Exactly 10, not 25
      expect(mockPopulationRepo.updatePerson).toHaveBeenCalledTimes(10)
    })
  })
})