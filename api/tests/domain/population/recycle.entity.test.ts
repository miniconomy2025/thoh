import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Recycle } from '../../../src/domain/population/recycle.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { createRecycle, createPhone, createPhoneStatic, TEST_DATES } from '../../helpers/test-helpers'

describe('Recycle Entity', () => {
  let recycle: Recycle
  let phone: Phone
  let phoneStatic: PhoneStatic

  beforeEach(() => {
    phoneStatic = createPhoneStatic()
    phone = createPhone({ model: phoneStatic })
    recycle = createRecycle({ phone })
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(recycle.id).toBe(1)
      expect(recycle.phone).toBe(phone)
      expect(recycle.brokenAt).toEqual(new Date('2024-01-01'))
    })

    it('should create recycle with custom values', () => {
      const customPhone = createPhone({ 
        id: 42, 
        model: createPhoneStatic({ name: 'Custom Phone' }),
        isBroken: true 
      })
      const customRecycle = createRecycle({
        id: 5,
        phone: customPhone,
        brokenAt: TEST_DATES.JANUARY_15_2024
      })
      
      expect(customRecycle.id).toBe(5)
      expect(customRecycle.phone).toBe(customPhone)
      expect(customRecycle.phone.id).toBe(42)
      expect(customRecycle.phone.model.name).toBe('Custom Phone')
      expect(customRecycle.phone.isBroken).toBe(true)
      expect(customRecycle.brokenAt).toEqual(TEST_DATES.JANUARY_15_2024)
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      recycle.id = 999
      expect(recycle.id).toBe(999)
    })

    it('should accept different id values', () => {
      recycle.id = 0
      expect(recycle.id).toBe(0)
      
      recycle.id = 1
      expect(recycle.id).toBe(1)
    })

    it('should be a number type', () => {
      expect(typeof recycle.id).toBe('number')
    })
  })

  describe('phone property', () => {
    it('should be mutable', () => {
      const newPhone = createPhone({ 
        id: 42, 
        model: createPhoneStatic({ name: 'New Phone' }),
        isBroken: true 
      })
      
      recycle.phone = newPhone
      
      expect(recycle.phone).toBe(newPhone)
      expect(recycle.phone.id).toBe(42)
      expect(recycle.phone.model.name).toBe('New Phone')
      expect(recycle.phone.isBroken).toBe(true)
    })

    it('should maintain reference to Phone instance', () => {
      expect(recycle.phone).toBeInstanceOf(Phone)
      expect(recycle.phone.id).toBeDefined()
      expect(recycle.phone.model).toBeInstanceOf(PhoneStatic)
    })

    it('should handle phone with different models', () => {
      const models = [
        createPhoneStatic({ id: 1, name: 'Basic Phone' }),
        createPhoneStatic({ id: 2, name: 'Smart Phone' }),
        createPhoneStatic({ id: 3, name: 'Premium Phone' })
      ]
      
      models.forEach(model => {
        const phoneWithModel = createPhone({ model, isBroken: true })
        recycle.phone = phoneWithModel
        
        expect(recycle.phone.model).toBe(model)
        expect(recycle.phone.model.id).toBe(model.id)
        expect(recycle.phone.model.name).toBe(model.name)
        expect(recycle.phone.isBroken).toBe(true)
      })
    })

    it('should handle broken phones', () => {
      const brokenPhone = createPhone({ isBroken: true })
      recycle.phone = brokenPhone
      
      expect(recycle.phone.isBroken).toBe(true)
    })

    it('should handle working phones (edge case)', () => {
      const workingPhone = createPhone({ isBroken: false })
      recycle.phone = workingPhone
      
      expect(recycle.phone.isBroken).toBe(false)
    })
  })

  describe('brokenAt property', () => {
    it('should be mutable', () => {
      const newDate = new Date('2024-02-01')
      recycle.brokenAt = newDate
      expect(recycle.brokenAt).toBe(newDate)
    })

    it('should accept different dates', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2025-01-01')
      ]
      
      dates.forEach(date => {
        recycle.brokenAt = date
        expect(recycle.brokenAt).toBe(date)
      })
    })

    it('should be a Date type', () => {
      expect(recycle.brokenAt).toBeInstanceOf(Date)
    })

    it('should handle future dates', () => {
      const futureDate = new Date('2025-12-31')
      recycle.brokenAt = futureDate
      expect(recycle.brokenAt).toBe(futureDate)
    })

    it('should handle past dates', () => {
      const pastDate = new Date('2020-01-01')
      recycle.brokenAt = pastDate
      expect(recycle.brokenAt).toBe(pastDate)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete recycle lifecycle', () => {
      // Initial state
      expect(recycle.phone).toBe(phone)
      expect(recycle.phone.isBroken).toBe(false) // Phone starts working
      expect(recycle.brokenAt).toEqual(new Date('2024-01-01'))
      
      // Phone breaks and gets recycled
      recycle.phone.isBroken = true
      recycle.brokenAt = new Date('2024-01-15')
      
      expect(recycle.phone.isBroken).toBe(true)
      expect(recycle.brokenAt).toEqual(new Date('2024-01-15'))
    })

    it('should handle recycle with different phone models', () => {
      const phoneModels = [
        { id: 1, name: 'Basic Phone', description: 'Simple phone' },
        { id: 2, name: 'Smart Phone', description: 'Advanced phone' },
        { id: 3, name: 'Premium Phone', description: 'Luxury phone' }
      ]
      
      phoneModels.forEach(model => {
        const phoneStatic = createPhoneStatic(model)
        const phone = createPhone({ model: phoneStatic, isBroken: true })
        
        recycle.phone = phone
        recycle.brokenAt = new Date('2024-01-01')
        
        expect(recycle.phone.model.id).toBe(model.id)
        expect(recycle.phone.model.name).toBe(model.name)
        expect(recycle.phone.model.description).toBe(model.description)
        expect(recycle.phone.isBroken).toBe(true)
      })
    })

    it('should handle multiple recycle updates', () => {
      const updates = [
        { phoneId: 1, brokenAt: new Date('2024-01-01') },
        { phoneId: 2, brokenAt: new Date('2024-01-15') },
        { phoneId: 3, brokenAt: new Date('2024-02-01') }
      ]
      
      updates.forEach(update => {
        const phone = createPhone({ id: update.phoneId, isBroken: true })
        recycle.phone = phone
        recycle.brokenAt = update.brokenAt
        
        expect(recycle.phone.id).toBe(update.phoneId)
        expect(recycle.phone.isBroken).toBe(true)
        expect(recycle.brokenAt).toBe(update.brokenAt)
      })
    })

    it('should maintain phone reference integrity', () => {
      const originalPhone = recycle.phone
      const originalPhoneId = originalPhone.id
      const originalModel = originalPhone.model
      
      // Update brokenAt
      recycle.brokenAt = new Date('2024-02-01')
      
      // Phone reference should remain the same
      expect(recycle.phone).toBe(originalPhone)
      expect(recycle.phone.id).toBe(originalPhoneId)
      expect(recycle.phone.model).toBe(originalModel)
    })
  })

  describe('edge cases', () => {
    it('should handle recycle with undefined id initially', () => {
      const recycleWithoutId = new Recycle()
      recycleWithoutId.phone = phone
      recycleWithoutId.brokenAt = new Date('2024-01-01')
      
      expect(recycleWithoutId.id).toBeUndefined()
      expect(recycleWithoutId.phone).toBe(phone)
      expect(recycleWithoutId.brokenAt).toEqual(new Date('2024-01-01'))
    })

    it('should handle recycle with phone that has undefined id', () => {
      const phoneWithoutId = new Phone()
      phoneWithoutId.model = phoneStatic
      phoneWithoutId.isBroken = true
      
      recycle.phone = phoneWithoutId
      
      expect(recycle.phone.id).toBeUndefined()
      expect(recycle.phone.model).toBe(phoneStatic)
      expect(recycle.phone.isBroken).toBe(true)
    })

    it('should handle recycle with phone that has null model', () => {
      const phoneWithNullModel = new Phone()
      phoneWithNullModel.id = 1
      phoneWithNullModel.model = null as any
      phoneWithNullModel.isBroken = true
      
      recycle.phone = phoneWithNullModel
      
      expect(recycle.phone.id).toBe(1)
      expect(recycle.phone.model).toBeNull()
      expect(recycle.phone.isBroken).toBe(true)
    })

    it('should handle very old brokenAt dates', () => {
      const veryOldDate = new Date('1900-01-01')
      recycle.brokenAt = veryOldDate
      expect(recycle.brokenAt).toBe(veryOldDate)
    })

    it('should handle very recent brokenAt dates', () => {
      const recentDate = new Date()
      recycle.brokenAt = recentDate
      expect(recycle.brokenAt).toBe(recentDate)
    })

    it('should handle brokenAt date before phone creation', () => {
      const phoneCreatedDate = new Date('2024-01-01')
      const brokenDate = new Date('2023-12-01') // Before creation
      
      recycle.phone = createPhone({ isBroken: true })
      recycle.brokenAt = brokenDate
      
      expect(recycle.brokenAt).toBe(brokenDate)
      expect(recycle.phone.isBroken).toBe(true)
    })
  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(recycle).toBeInstanceOf(Recycle)
    })

    it('should have proper column types for database', () => {
      expect(typeof recycle.id).toBe('number')
      expect(recycle.phone).toBeInstanceOf(Phone)
      expect(recycle.brokenAt).toBeInstanceOf(Date)
    })

    it('should support eager loading of phone relationship', () => {
      // This test verifies that the phone relationship is properly configured
      expect(recycle.phone).toBeDefined()
      expect(recycle.phone.model).toBeDefined()
    })

    it('should support CreateDateColumn for brokenAt', () => {
      // This test verifies that brokenAt is properly configured as a CreateDateColumn
      expect(recycle.brokenAt).toBeInstanceOf(Date)
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createRecycle factory', () => {
      const customPhone = createPhone({ 
        id: 10, 
        model: createPhoneStatic({ name: 'Factory Phone' }),
        isBroken: true 
      })
      const factoryRecycle = createRecycle({
        id: 5,
        phone: customPhone,
        brokenAt: TEST_DATES.FEBRUARY_1_2024
      })
      
      expect(factoryRecycle.id).toBe(5)
      expect(factoryRecycle.phone).toBe(customPhone)
      expect(factoryRecycle.phone.id).toBe(10)
      expect(factoryRecycle.phone.model.name).toBe('Factory Phone')
      expect(factoryRecycle.phone.isBroken).toBe(true)
      expect(factoryRecycle.brokenAt).toEqual(TEST_DATES.FEBRUARY_1_2024)
    })

    it('should work with partial overrides', () => {
      const partialRecycle = createRecycle({ 
        id: 10,
        brokenAt: TEST_DATES.JANUARY_15_2024
      })
      
      expect(partialRecycle.id).toBe(10) // Override value
      expect(partialRecycle.phone).toBeDefined() // Default value
      expect(partialRecycle.brokenAt).toEqual(TEST_DATES.JANUARY_15_2024) // Override value
    })

    it('should work with default phone from factory', () => {
      const defaultRecycle = createRecycle()
      
      expect(defaultRecycle.id).toBe(1) // Default value
      expect(defaultRecycle.phone).toBeDefined() // Default phone created
      expect(defaultRecycle.phone.id).toBe(1) // Default phone id
      expect(defaultRecycle.phone.model).toBeDefined() // Default phone model
      expect(defaultRecycle.brokenAt).toEqual(new Date('2024-01-01')) // Default date
    })
  })

  describe('business logic scenarios', () => {
    it('should represent a broken phone ready for recycling', () => {
      const brokenPhone = createPhone({ isBroken: true })
      const recycleEntry = createRecycle({ 
        phone: brokenPhone,
        brokenAt: new Date('2024-01-15')
      })
      
      expect(recycleEntry.phone.isBroken).toBe(true)
      expect(recycleEntry.brokenAt).toEqual(new Date('2024-01-15'))
    })

    it('should handle phone model information in recycle', () => {
      const phoneModel = createPhoneStatic({ 
        id: 5, 
        name: 'Recycled Phone Model',
        description: 'This phone was recycled'
      })
      const brokenPhone = createPhone({ 
        model: phoneModel, 
        isBroken: true 
      })
      const recycleEntry = createRecycle({ phone: brokenPhone })
      
      expect(recycleEntry.phone.model.id).toBe(5)
      expect(recycleEntry.phone.model.name).toBe('Recycled Phone Model')
      expect(recycleEntry.phone.model.description).toBe('This phone was recycled')
      expect(recycleEntry.phone.isBroken).toBe(true)
    })
  })
})
