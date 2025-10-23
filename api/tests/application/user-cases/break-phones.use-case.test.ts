import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BreakPhonesUseCase } from '../../../src/application/user-cases/break-phones.use-case'
import { Person } from '../../../src/domain/population/person.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { Recycle } from '../../../src/domain/population/recycle.entity'
import { createPerson, createPhone, createPhoneStatic } from '../../helpers/test-helpers'

// Mock PersonRepository
const mockPersonRepo = {
  find: vi.fn(),
  save: vi.fn()
}

// Mock RecycleRepository
const mockRecycleRepo = {
  save: vi.fn()
}

// Mock the repositories
vi.mock('../../../src/infrastructure/persistence/postgres/person.repository', () => ({
  PersonRepository: {
    getRepo: () => mockPersonRepo
  }
}))

vi.mock('../../../src/infrastructure/persistence/postgres/recycle.repository', () => ({
  RecycleRepository: vi.fn().mockImplementation(() => mockRecycleRepo)
}))

// Mock PopulationRepository
const mockPopulationRepo = {
  updatePerson: vi.fn()
}

describe('BreakPhonesUseCase', () => {
  let useCase: BreakPhonesUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new BreakPhonesUseCase(mockPopulationRepo as any)
    // Mock Math.random to return predictable values
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  describe('execute', () => {
    it('should break phones for people with phones', async () => {
      // Arrange
      const phoneModel1 = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phoneModel2 = createPhoneStatic({ id: 2, name: 'Cosmos_Z25' })
      const phone1 = createPhone({ id: 1, model: phoneModel1, isBroken: false })
      const phone2 = createPhone({ id: 2, model: phoneModel2, isBroken: false })
      
      const person1 = createPerson({ id: 1, phone: phone1 })
      const person2 = createPerson({ id: 2, phone: phone2 })
      const person3 = createPerson({ id: 3, phone: null })
      
      mockPersonRepo.find.mockResolvedValue([person1, person2, person3])
      mockRecycleRepo.save.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockPersonRepo.find).toHaveBeenCalledWith({ relations: ['phone', 'phone.model'] })
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(2) // Should break 2 phones
      
      // Check that phones were marked as broken
      expect(phone1.isBroken).toBe(true)
      expect(phone2.isBroken).toBe(true)
      
      // Check that people no longer have phones
      expect(person1.phone).toBeNull()
      expect(person2.phone).toBeNull()
      expect(person3.phone).toBeNull() // Already null
    })

    it('should handle people without phones', async () => {
      // Arrange
      const person1 = createPerson({ id: 1, phone: null })
      const person2 = createPerson({ id: 2, phone: null })
      
      mockPersonRepo.find.mockResolvedValue([person1, person2])

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).not.toHaveBeenCalled()
      expect(person1.phone).toBeNull()
      expect(person2.phone).toBeNull()
    })

    it('should handle empty people list', async () => {
      // Arrange
      mockPersonRepo.find.mockResolvedValue([])

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).not.toHaveBeenCalled()
    })

    it('should create recycle entries for broken phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel, isBroken: false })
      const person = createPerson({ id: 1, phone: phone })
      
      mockPersonRepo.find.mockResolvedValue([person])
      mockRecycleRepo.save.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: phone
        })
      )
    })

    it('should handle mixed scenarios (some with phones, some without)', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel, isBroken: false })
      
      const personWithPhone = createPerson({ id: 1, phone: phone })
      const personWithoutPhone = createPerson({ id: 2, phone: null })
      const personWithBrokenPhone = createPerson({ 
        id: 3, 
        phone: createPhone({ id: 2, model: phoneModel, isBroken: true })
      })
      
      mockPersonRepo.find.mockResolvedValue([personWithPhone, personWithoutPhone, personWithBrokenPhone])
      mockRecycleRepo.save.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockRecycleRepo.save).toHaveBeenCalledTimes(2) // Should break 2 phones (working ones)
      expect(personWithPhone.phone).toBeNull()
      expect(personWithoutPhone.phone).toBeNull()
      expect(personWithBrokenPhone.phone).toBeNull()
    })

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel, isBroken: false })
      const person = createPerson({ id: 1, phone: phone })
      
      mockPersonRepo.find.mockResolvedValue([person])
      mockRecycleRepo.save.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database error')
    })
  })
})
