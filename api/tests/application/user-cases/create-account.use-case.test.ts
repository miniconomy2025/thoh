import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateAccountUseCase } from '../../../src/application/user-cases/create-account.use-case'
import { Person } from '../../../src/domain/population/person.entity'
import { createPerson } from '../../helpers/test-helpers'

// Mock QueueFactory
const mockCriticalQueue = {
  sendMessage: vi.fn()
}

vi.mock('../../../src/infrastructure/queue/queue.factory', () => ({
  QueueFactory: {
    getCriticalQueue: () => mockCriticalQueue
  }
}))

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase
  let person: Person

  beforeEach(() => {
    vi.clearAllMocks()
    person = createPerson({ 
      id: 1, 
      salary: 50000, 
      accountNumber: null 
    })
    useCase = new CreateAccountUseCase(person)
  })

  describe('execute', () => {
    it('should create account for person without account number', async () => {
      // Arrange
      mockCriticalQueue.sendMessage.mockResolvedValue({})

      // Act
      await useCase.execute()

      // Assert
      expect(mockCriticalQueue.sendMessage).toHaveBeenCalledWith({
        body: {
          type: 'account_creation',
          payload: {
            salaryCents: 5000000, // 50000 * 100
            personId: 1
          }
        },
        messageGroupId: 'account-creation',
        attributes: {
          MessageDeduplicationId: expect.stringMatching(/^account-creation-1-/)
        }
      })
    })

    it('should skip account creation if person already has account', async () => {
      // Arrange
      const personWithAccount = createPerson({ 
        id: 2, 
        salary: 60000, 
        accountNumber: '123456789' 
      })
      const useCaseWithAccount = new CreateAccountUseCase(personWithAccount)

      // Act
      await useCaseWithAccount.execute()

      // Assert
      expect(mockCriticalQueue.sendMessage).not.toHaveBeenCalled()
    })

    it('should throw error when person ID is missing', async () => {
      // Arrange
      const personWithoutId = createPerson({ 
        id: undefined as any, 
        salary: 50000, 
        accountNumber: null 
      })
      const useCaseWithoutId = new CreateAccountUseCase(personWithoutId)

      // Act & Assert
      await expect(useCaseWithoutId.execute()).rejects.toThrow(
        'Person ID and salary are required for account creation'
      )
      expect(mockCriticalQueue.sendMessage).not.toHaveBeenCalled()
    })

    it('should throw error when person salary is missing', async () => {
      // Arrange
      const personWithoutSalary = createPerson({ 
        id: 1, 
        salary: undefined as any, 
        accountNumber: null 
      })
      const useCaseWithoutSalary = new CreateAccountUseCase(personWithoutSalary)

      // Act & Assert
      await expect(useCaseWithoutSalary.execute()).rejects.toThrow(
        'Person ID and salary are required for account creation'
      )
      expect(mockCriticalQueue.sendMessage).not.toHaveBeenCalled()
    })

    it('should handle zero salary', async () => {
      // Arrange
      const personWithZeroSalary = createPerson({ 
        id: 1, 
        salary: 0, 
        accountNumber: null 
      })
      const useCaseWithZeroSalary = new CreateAccountUseCase(personWithZeroSalary)
      mockCriticalQueue.sendMessage.mockResolvedValue({})

      // Act
      await useCaseWithZeroSalary.execute()

      // Assert
      expect(mockCriticalQueue.sendMessage).toHaveBeenCalledWith({
        body: {
          type: 'account_creation',
          payload: {
            salaryCents: 0, // 0 * 100
            personId: 1
          }
        },
        messageGroupId: 'account-creation',
        attributes: {
          MessageDeduplicationId: expect.stringMatching(/^account-creation-1-/)
        }
      })
    })

    it('should handle decimal salary conversion', async () => {
      // Arrange
      const personWithDecimalSalary = createPerson({ 
        id: 1, 
        salary: 50000.75, 
        accountNumber: null 
      })
      const useCaseWithDecimalSalary = new CreateAccountUseCase(personWithDecimalSalary)
      mockCriticalQueue.sendMessage.mockResolvedValue({})

      // Act
      await useCaseWithDecimalSalary.execute()

      // Assert
      expect(mockCriticalQueue.sendMessage).toHaveBeenCalledWith({
        body: {
          type: 'account_creation',
          payload: {
            salaryCents: 5000075, // Math.floor(50000.75 * 100)
            personId: 1
          }
        },
        messageGroupId: 'account-creation',
        attributes: {
          MessageDeduplicationId: expect.stringMatching(/^account-creation-1-/)
        }
      })
    })

    it('should handle queue errors', async () => {
      // Arrange
      mockCriticalQueue.sendMessage.mockRejectedValue(new Error('Queue error'))

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Queue error')
    })

    it('should generate unique message deduplication IDs', async () => {
      // Arrange
      const person1 = createPerson({ id: 1, salary: 50000, accountNumber: null })
      const person2 = createPerson({ id: 2, salary: 60000, accountNumber: null })
      const useCase1 = new CreateAccountUseCase(person1)
      const useCase2 = new CreateAccountUseCase(person2)
      
      mockCriticalQueue.sendMessage.mockResolvedValue({})

      // Act
      await useCase1.execute()
      await useCase2.execute()

      // Assert
      expect(mockCriticalQueue.sendMessage).toHaveBeenCalledTimes(2)
      
      const call1 = mockCriticalQueue.sendMessage.mock.calls[0][0]
      const call2 = mockCriticalQueue.sendMessage.mock.calls[1][0]
      
      expect(call1.attributes.MessageDeduplicationId).toMatch(/^account-creation-1-/)
      expect(call2.attributes.MessageDeduplicationId).toMatch(/^account-creation-2-/)
      expect(call1.attributes.MessageDeduplicationId).not.toBe(call2.attributes.MessageDeduplicationId)
    })
  })
})
