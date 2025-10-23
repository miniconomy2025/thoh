import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ReceivePhoneUseCase } from '../../../src/application/user-cases/recieve-phone-use-case'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { Person } from '../../../src/domain/population/person.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { createPerson, createPhoneStatic, createPhone } from '../../helpers/test-helpers'

// Mock PersonRepository
const mockPersonRepo = {
  findOne: vi.fn(),
  save: vi.fn()
}

vi.mock('../../../src/infrastructure/persistence/postgres/person.repository', () => ({
  PersonRepository: {
    getRepo: () => mockPersonRepo
  }
}))

describe('ReceivePhoneUseCase', () => {
  let useCase: ReceivePhoneUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    mockPersonRepo.findOne.mockClear()
    mockPersonRepo.save.mockClear()
    useCase = new ReceivePhoneUseCase()
  })

  describe('execute', () => {
    it('should assign phone to person when found', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: null 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockResolvedValue(person)

      // Mock Math.random for phone ID generation
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      expect(mockPersonRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
        relations: ['phone', 'phone.model']
      })

      expect(mockPersonRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          accountNumber: 'ACC123',
          phone: expect.objectContaining({
            id: expect.any(Number),
            isBroken: false,
            model: phoneModel
          })
        })
      )
    })

    it('should handle person not found gracefully', async () => {
      // Arrange
      const accountNumber = 'NONEXISTENT'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })

      mockPersonRepo.findOne.mockResolvedValue(null)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      expect(mockPersonRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
        relations: ['phone', 'phone.model']
      })
      expect(mockPersonRepo.save).not.toHaveBeenCalled()
    })

    it('should generate random phone ID', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: null 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockResolvedValue(person)

      // Mock Math.random to return specific value
      vi.spyOn(Math, 'random').mockReturnValue(0.123456)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      const savedPerson = mockPersonRepo.save.mock.calls[0][0]
      expect(savedPerson.phone.id).toBe(Math.floor(0.123456 * 1_000_000))
    })

    it('should set phone as not broken by default', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: null 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockResolvedValue(person)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      const savedPerson = mockPersonRepo.save.mock.calls[0][0]
      expect(savedPerson.phone.isBroken).toBe(false)
    })

    it('should replace existing phone if person already has one', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 2, name: 'ePhone_plus' })
      const existingPhone = createPhone({ id: 999, isBroken: true })
      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: existingPhone 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockResolvedValue(person)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      const savedPerson = mockPersonRepo.save.mock.calls[0][0]
      expect(savedPerson.phone.model).toBe(phoneModel)
      expect(savedPerson.phone.isBroken).toBe(false)
      expect(savedPerson.phone.id).not.toBe(999) // Should be new random ID
    })

    it('should handle save errors', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: null 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(useCase.execute(accountNumber, phoneModel)).rejects.toThrow('Database error')
    })

    it('should handle findOne errors', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })

      mockPersonRepo.findOne.mockRejectedValue(new Error('Database connection error'))

      // Act & Assert
      await expect(useCase.execute(accountNumber, phoneModel)).rejects.toThrow('Database connection error')
    })

    it('should work with different phone models', async () => {
      // Arrange
      const accountNumber = 'ACC123'
      const phoneModels = [
        createPhoneStatic({ id: 1, name: 'ePhone' }),
        createPhoneStatic({ id: 2, name: 'ePhone_plus' }),
        createPhoneStatic({ id: 3, name: 'Cosmos_Z25' }),
        createPhoneStatic({ id: 4, name: 'Cosmos_Z25_ultra' })
      ]

      const person = createPerson({ 
        id: 1, 
        accountNumber, 
        phone: null 
      })

      mockPersonRepo.findOne.mockResolvedValue(person)
      mockPersonRepo.save.mockResolvedValue(person)

      // Act & Assert - Test each model
      for (const model of phoneModels) {
        await useCase.execute(accountNumber, model)
        
        const savedPerson = mockPersonRepo.save.mock.calls[mockPersonRepo.save.mock.calls.length - 1][0]
        expect(savedPerson.phone.model).toBe(model)
      }
    })

    it('should handle empty account number', async () => {
      // Arrange
      const accountNumber = ''
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })

      mockPersonRepo.findOne.mockResolvedValue(null)

      // Act
      await useCase.execute(accountNumber, phoneModel)

      // Assert
      expect(mockPersonRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber: '' },
        relations: ['phone', 'phone.model']
      })
      expect(mockPersonRepo.save).not.toHaveBeenCalled()
    })
  })
})