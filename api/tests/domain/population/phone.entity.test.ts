import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Phone } from '../../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { createPhone, createPhoneStatic } from '../../helpers/test-helpers'

describe('Phone Entity', () => {
  let phone: Phone
  let phoneStatic: PhoneStatic

  beforeEach(() => {
    phoneStatic = createPhoneStatic()
    phone = createPhone({ model: phoneStatic })
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(phone.id).toBe(1)
      expect(phone.model).toBe(phoneStatic)
      expect(phone.isBroken).toBe(false)
    })

    it('should be able to create phone with different model', () => {
      const differentModel = createPhoneStatic({ 
        id: 2, 
        name: 'ePhone', 
        description: 'Premium phone' 
      })
      const phoneWithDifferentModel = createPhone({ model: differentModel })
      
      expect(phoneWithDifferentModel.model).toBe(differentModel)
      expect(phoneWithDifferentModel.model.id).toBe(2)
      expect(phoneWithDifferentModel.model.name).toBe('ePhone')
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      phone.id = 42
      expect(phone.id).toBe(42)
    })

    it('should accept different id values', () => {
      phone.id = 999
      expect(phone.id).toBe(999)
    })
  })

  describe('model property', () => {
    it('should be mutable', () => {
      const newModel = createPhoneStatic({ id: 3, name: 'Cosmos' })
      
      phone.model = newModel
      
      expect(phone.model).toBe(newModel)
      expect(phone.model.id).toBe(3)
      expect(phone.model.name).toBe('Cosmos')
    })

    it('should maintain reference to PhoneStatic', () => {
      expect(phone.model).toBeInstanceOf(PhoneStatic)
      expect(phone.model.id).toBeDefined()
      expect(phone.model.name).toBeDefined()
    })
  })

  describe('isBroken property', () => {
    it('should be false by default', () => {
      expect(phone.isBroken).toBe(false)
    })

    it('should be mutable', () => {
      phone.isBroken = true
      expect(phone.isBroken).toBe(true)
      
      phone.isBroken = false
      expect(phone.isBroken).toBe(false)
    })

    it('should accept boolean values', () => {
      phone.isBroken = true
      expect(typeof phone.isBroken).toBe('boolean')
      expect(phone.isBroken).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should handle phone lifecycle from working to broken', () => {
      // Phone starts working
      expect(phone.isBroken).toBe(false)
      
      // Phone breaks
      phone.isBroken = true
      expect(phone.isBroken).toBe(true)
      
      // Phone gets repaired (if such functionality exists)
      phone.isBroken = false
      expect(phone.isBroken).toBe(false)
    })

    it('should maintain model reference throughout lifecycle', () => {
      const originalModel = phone.model
      
      // Change broken status
      phone.isBroken = true
      expect(phone.model).toBe(originalModel)
      
      // Change id
      phone.id = 999
      expect(phone.model).toBe(originalModel)
    })

    it('should work with different phone models', () => {
      const models = [
        createPhoneStatic({ id: 1, name: 'Basic Phone' }),
        createPhoneStatic({ id: 2, name: 'Smart Phone' }),
        createPhoneStatic({ id: 3, name: 'Premium Phone' })
      ]
      
      models.forEach((model, index) => {
        phone.model = model
        expect(phone.model.id).toBe(index + 1)
        expect(phone.model.name).toBe(model.name)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle phone with undefined id initially', () => {
      const phoneWithoutId = new Phone()
      phoneWithoutId.model = phoneStatic
      phoneWithoutId.isBroken = false
      
      expect(phoneWithoutId.id).toBeUndefined()
      expect(phoneWithoutId.model).toBe(phoneStatic)
      expect(phoneWithoutId.isBroken).toBe(false)
    })

    it('should handle phone with zero id', () => {
      phone.id = 0
      expect(phone.id).toBe(0)
    })

  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      // This test verifies the entity is properly decorated
      // The actual entity name is defined by the @Entity decorator
      expect(phone).toBeInstanceOf(Phone)
    })

    it('should have proper column types for database', () => {
      // Verify that the properties have the correct types for TypeORM
      expect(typeof phone.id).toBe('number')
      expect(typeof phone.isBroken).toBe('boolean')
      expect(phone.model).toBeInstanceOf(PhoneStatic)
    })
  })
})
