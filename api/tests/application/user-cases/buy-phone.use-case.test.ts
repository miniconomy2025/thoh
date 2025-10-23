import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BuyPhoneUseCase } from '../../../src/application/user-cases/buy-phone-use-case'
import { Person } from '../../../src/domain/population/person.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { createPerson, createPhone, createPhoneStatic } from '../../helpers/test-helpers'

// Mock PersonRepository
const mockPersonRepo = {
  find: vi.fn()
}

// Mock the static method
vi.mock('../../../src/infrastructure/persistence/postgres/person.repository', () => ({
  PersonRepository: {
    getRepo: () => mockPersonRepo
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('BuyPhoneUseCase', () => {
  let useCase: BuyPhoneUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new BuyPhoneUseCase()
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // Mock random for consistent testing
  })

  describe('execute', () => {
    it('should skip people who already have phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel })
      const personWithPhone = createPerson({ id: 1, phone: phone })
      const personWithoutPhone = createPerson({ id: 2, phone: null, accountNumber: '123456789' })
      
      mockPersonRepo.find.mockResolvedValue([personWithPhone, personWithoutPhone])
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only called for person without phone
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(personWithoutPhone.accountNumber!)
        })
      )
    })

    it('should create order with Pear API when random is even', async () => {
      // Arrange
      vi.spyOn(Math, 'random').mockReturnValue(0.0) // Even number (0.0 % 2 = 0)
      const person = createPerson({ id: 1, phone: null, accountNumber: '123456789' })
      
      mockPersonRepo.find.mockResolvedValue([person])
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pear-company-api.projects.bbdgrad.com/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_number: '123456789',
            items: [{ name: 'ePhone', quantity: 1 }]
          })
        }
      )
    })

    it('should create order with SumSang API when random is odd', async () => {
      // Arrange
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Odd number (0.5 % 2 = 0.5, which is truthy)
      const person = createPerson({ id: 1, phone: null, accountNumber: '987654321' })
      
      mockPersonRepo.find.mockResolvedValue([person])
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sumsang-phones-api.projects.bbdgrad.com/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_number: '987654321',
            items: [{ name: 'Cosmos_Z25_ultra', quantity: 1 }]
          })
        }
      )
    })

    it('should stop processing when API call fails', async () => {
      // Arrange
      const person1 = createPerson({ id: 1, phone: null, accountNumber: '111111111' })
      const person2 = createPerson({ id: 2, phone: null, accountNumber: '222222222' })
      
      mockPersonRepo.find.mockResolvedValue([person1, person2])
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should stop after first failure
    })

    it('should handle network errors gracefully', async () => {
      // Arrange
      const person = createPerson({ id: 1, phone: null, accountNumber: '333333333' })
      
      mockPersonRepo.find.mockResolvedValue([person])
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      // Act
      await expect(useCase.execute()).resolves.not.toThrow()

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle empty people list', async () => {
      // Arrange
      mockPersonRepo.find.mockResolvedValue([])

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle people with null account numbers', async () => {
      // Arrange
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Mock random for SumSang
      const person = createPerson({ id: 1, phone: null, accountNumber: null })
      
      mockPersonRepo.find.mockResolvedValue([person])
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sumsang-phones-api.projects.bbdgrad.com/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_number: null,
            items: [{ name: 'Cosmos_Z25_ultra', quantity: 1 }]
          })
        }
      )
    })
  })
})
