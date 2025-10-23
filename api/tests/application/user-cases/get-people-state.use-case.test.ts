import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetPeopleStateUseCase } from '../../../src/application/user-cases/get-people-state.use-case'
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

describe('GetPeopleStateUseCase', () => {
  let useCase: GetPeopleStateUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetPeopleStateUseCase({} as any) // Population repo not used in this use case
  })

  describe('execute', () => {
    it('should return people state with phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 1, name: 'ePhone' })
      const phone = createPhone({ id: 1, model: phoneModel, isBroken: false })
      const person = createPerson({ 
        id: 1, 
        salary: 50000, 
        phone: phone 
      })
      
      mockPersonRepo.find.mockResolvedValue([person])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.people).toHaveLength(1)
      expect(result.people[0]).toEqual({
        id: 1,
        salary: 50000,
        phone: {
          id: 1,
          isBroken: false,
          model: {
            id: 1,
            name: 'ePhone'
          }
        },
        phoneWorking: true
      })
    })

    it('should return people state without phones', async () => {
      // Arrange
      const person = createPerson({ 
        id: 2, 
        salary: 60000, 
        phone: null 
      })
      
      mockPersonRepo.find.mockResolvedValue([person])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.people).toHaveLength(1)
      expect(result.people[0]).toEqual({
        id: 2,
        salary: 60000,
        phone: null,
        phoneWorking: false
      })
    })

    it('should return people state with broken phones', async () => {
      // Arrange
      const phoneModel = createPhoneStatic({ id: 2, name: 'Cosmos_Z25' })
      const phone = createPhone({ id: 2, model: phoneModel, isBroken: true })
      const person = createPerson({ 
        id: 3, 
        salary: 70000, 
        phone: phone 
      })
      
      mockPersonRepo.find.mockResolvedValue([person])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.people).toHaveLength(1)
      expect(result.people[0]).toEqual({
        id: 3,
        salary: 70000,
        phone: {
          id: 2,
          isBroken: true,
          model: {
            id: 2,
            name: 'Cosmos_Z25'
          }
        },
        phoneWorking: false
      })
    })

    it('should return empty array when no people found', async () => {
      // Arrange
      mockPersonRepo.find.mockResolvedValue([])

      // Act
      const result = await useCase.execute()

      // Assert
      expect(result.people).toEqual([])
    })
  })
})
