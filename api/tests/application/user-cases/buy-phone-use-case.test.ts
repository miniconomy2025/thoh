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

vi.mock('../../../src/infrastructure/persistence/postgres/person.repository', () => ({
  PersonRepository: {
    getRepo: () => mockPersonRepo
  }
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('BuyPhoneUseCase', () => {
  let useCase: BuyPhoneUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    mockPersonRepo.find.mockClear()
    mockFetch.mockClear()
    useCase = new BuyPhoneUseCase()
  })

  describe('execute', () => {
    it('should skip people who already have phones', async () => {
      // Arrange
      const personWithPhone = createPerson({
        id: 1,
        accountNumber: 'ACC001',
        phone: createPhone()
      })
      const personWithoutPhone = createPerson({
        id: 2,
        accountNumber: 'ACC002',
        phone: null
      })

      mockPersonRepo.find.mockResolvedValue([personWithPhone, personWithoutPhone])
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only called for person without phone
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/(pear-company-api|sumsang-phones-api)\.projects\.bbdgrad\.com\/orders/),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('ACC002')
        })
      )
    })

    it('should create orders for people without phones', async () => {
      // Arrange
      const peopleWithoutPhones = [
        createPerson({ id: 1, accountNumber: 'ACC001', phone: null }),
        createPerson({ id: 2, accountNumber: 'ACC002', phone: null }),
        createPerson({ id: 3, accountNumber: 'ACC003', phone: null })
      ]

      mockPersonRepo.find.mockResolvedValue(peopleWithoutPhones)
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/(pear-company-api|sumsang-phones-api)\.projects\.bbdgrad\.com\/orders/),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('ACC001')
        })
      )
    })

    it('should use correct phone models for each supplier', async () => {
      // Arrange
      const person = createPerson({ id: 1, accountNumber: 'ACC001', phone: null })
      mockPersonRepo.find.mockResolvedValue([person])
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      // Mock Math.random to control supplier selection
      // Math.random() % 2 === 0 means even numbers (0, 2, 4, etc.) will use Pear
      vi.spyOn(Math, 'random').mockReturnValue(0.0) // Will use Pear (0 % 2 === 0)

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://pear-company-api.projects.bbdgrad.com/orders',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringMatching(/"(ePhone|ePhone_plus|ePhone_pro_max)"/)
        })
      )
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      const person = createPerson({ id: 1, accountNumber: 'ACC001', phone: null })
      mockPersonRepo.find.mockResolvedValue([person])
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1)
      // Should not throw error, just log and continue
    })

    it('should handle network errors gracefully', async () => {
      // Arrange
      const person = createPerson({ id: 1, accountNumber: 'ACC001', phone: null })
      mockPersonRepo.find.mockResolvedValue([person])
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1)
      // Should not throw error, just log and continue
    })

    it('should stop processing on first failure', async () => {
      // Arrange
      const people = [
        createPerson({ id: 1, accountNumber: 'ACC001', phone: null }),
        createPerson({ id: 2, accountNumber: 'ACC002', phone: null }),
        createPerson({ id: 3, accountNumber: 'ACC003', phone: null })
      ]

      mockPersonRepo.find.mockResolvedValue(people)
      mockFetch
        .mockResolvedValueOnce({ ok: false, statusText: 'Error' }) // First call fails
        .mockResolvedValueOnce({ ok: true, statusText: 'OK' }) // Second call would succeed
        .mockResolvedValueOnce({ ok: true, statusText: 'OK' }) // Third call would succeed

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only first call made
    })

    it('should include correct order structure', async () => {
      // Arrange
      const person = createPerson({ 
        id: 1, 
        accountNumber: 'ACC123', 
        phone: null 
      })
      mockPersonRepo.find.mockResolvedValue([person])
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      // Act
      await useCase.execute()

      // Assert
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      
      expect(body).toEqual({
        account_number: 'ACC123',
        items: [{ 
          name: expect.stringMatching(/^(ePhone|ePhone_plus|ePhone_pro_max|Cosmos_Z25|Cosmos_Z25_ultra|Cosmos_Z25_FE)$/),
          quantity: 1 
        }]
      })
    })

    it('should handle empty people list', async () => {
      // Arrange
      mockPersonRepo.find.mockResolvedValue([])
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle people with null account numbers', async () => {
      // Arrange
      const personWithoutAccount = createPerson({ 
        id: 1, 
        accountNumber: null, 
        phone: null 
      })
      mockPersonRepo.find.mockResolvedValue([personWithoutAccount])
      mockFetch.mockResolvedValue({ ok: true, statusText: 'OK' })

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.account_number).toBeNull()
    })
  })
})