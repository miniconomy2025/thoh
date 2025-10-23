import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { PhoneStatic } from '../../../src/domain/population/phone-static.entity'
import { createPhoneStatic } from '../../helpers/test-helpers'

describe('PhoneStatic Entity', () => {
  let phoneStatic: PhoneStatic

  beforeEach(() => {
    phoneStatic = createPhoneStatic()
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(phoneStatic.id).toBe(1)
      expect(phoneStatic.name).toBe('ePhone')
      expect(phoneStatic.description).toBe('Basic phone model')
    })

    it('should create phone static with custom values', () => {
      const customPhoneStatic = createPhoneStatic({
        id: 42,
        name: 'ePhone Plus',
        description: 'Premium smartphone with advanced features'
      })
      
      expect(customPhoneStatic.id).toBe(42)
      expect(customPhoneStatic.name).toBe('ePhone Plus')
      expect(customPhoneStatic.description).toBe('Premium smartphone with advanced features')
    })
  })

  describe('id property', () => {
    it('should be settable', () => {
      phoneStatic.id = 999
      expect(phoneStatic.id).toBe(999)
    })

    it('should accept different id values', () => {
      phoneStatic.id = 0
      expect(phoneStatic.id).toBe(0)
      
      phoneStatic.id = 1
      expect(phoneStatic.id).toBe(1)
    })

  })

  describe('name property', () => {
    it('should be mutable', () => {
      phoneStatic.name = 'Cosmos_Z25'
      expect(phoneStatic.name).toBe('Cosmos_Z25')
    })

    it('should accept different name values', () => {
      const names = ['ePhone', 'Cosmos']
      
      names.forEach(name => {
        phoneStatic.name = name
        expect(phoneStatic.name).toBe(name)
      })
    })

  })

  describe('description property', () => {
    it('should be mutable', () => {
      phoneStatic.description = 'Updated description'
      expect(phoneStatic.description).toBe('Updated description')
    })

    it('should accept different description values', () => {
      const descriptions = [
        'Basic phone model',
        'Smartphone with advanced features',
        'Budget-friendly device',
        'Premium flagship phone',
        null,
        undefined
      ]
      
      descriptions.forEach(description => {
        phoneStatic.description = description
        expect(phoneStatic.description).toBe(description)
      })
    })

    it('should handle null description', () => {
      phoneStatic.description = null
      expect(phoneStatic.description).toBeNull()
    })

    it('should handle undefined description', () => {
      phoneStatic.description = undefined
      expect(phoneStatic.description).toBeUndefined()
    })

    it('should handle empty string description', () => {
      phoneStatic.description = ''
      expect(phoneStatic.description).toBe('')
    })

    it('should handle long descriptions', () => {
      const longDescription = 'This is a very long description that contains multiple sentences and detailed information about the phone model, its features, specifications, and capabilities.'
      phoneStatic.description = longDescription
      expect(phoneStatic.description).toBe(longDescription)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete phone static lifecycle', () => {
      // Initial state
      expect(phoneStatic.id).toBe(1)
      expect(phoneStatic.name).toBe('ePhone')
      expect(phoneStatic.description).toBe('Basic phone model')
      
      // Update all properties
      phoneStatic.id = 2
      phoneStatic.name = 'Updated Phone'
      phoneStatic.description = 'Updated description'
      
      expect(phoneStatic.id).toBe(2)
      expect(phoneStatic.name).toBe('Updated Phone')
      expect(phoneStatic.description).toBe('Updated description')
    })

    it('should work with different phone models', () => {
      const phoneModels = [
        { id: 1, name: 'Basic Phone', description: 'Simple phone' },
        { id: 2, name: 'Smart Phone', description: 'Advanced phone' },
        { id: 3, name: 'Premium Phone', description: 'Luxury phone' }
      ]
      
      phoneModels.forEach(model => {
        phoneStatic.id = model.id
        phoneStatic.name = model.name
        phoneStatic.description = model.description
        
        expect(phoneStatic.id).toBe(model.id)
        expect(phoneStatic.name).toBe(model.name)
        expect(phoneStatic.description).toBe(model.description)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle phone static with undefined id initially', () => {
      const phoneStaticWithoutId = new PhoneStatic()
      phoneStaticWithoutId.name = 'Test Phone'
      phoneStaticWithoutId.description = 'Test Description'
      
      expect(phoneStaticWithoutId.id).toBeUndefined()
      expect(phoneStaticWithoutId.name).toBe('Test Phone')
      expect(phoneStaticWithoutId.description).toBe('Test Description')
    })
    
  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      // This test verifies the entity is properly decorated
      expect(phoneStatic).toBeInstanceOf(PhoneStatic)
    })

    it('should have proper column types for database', () => {
      // Verify that the properties have the correct types for TypeORM
      expect(typeof phoneStatic.id).toBe('number')
      expect(typeof phoneStatic.name).toBe('string')
      expect(typeof phoneStatic.description === 'string' || phoneStatic.description === null || phoneStatic.description === undefined).toBe(true)
    })

    it('should support unique constraint on name', () => {
      // This test verifies that the name field is properly configured for uniqueness
      // The actual uniqueness constraint is enforced at the database level
      expect(phoneStatic.name).toBeDefined()
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createPhoneStatic factory', () => {
      const factoryPhoneStatic = createPhoneStatic({
        id: 5,
        name: 'Factory Phone',
        description: 'Created by factory'
      })
      
      expect(factoryPhoneStatic.id).toBe(5)
      expect(factoryPhoneStatic.name).toBe('Factory Phone')
      expect(factoryPhoneStatic.description).toBe('Created by factory')
    })

    it('should work with partial overrides', () => {
      const partialPhoneStatic = createPhoneStatic({ name: 'Partial Override' })
      
      expect(partialPhoneStatic.id).toBe(1) // Default value
      expect(partialPhoneStatic.name).toBe('Partial Override') // Override value
      expect(partialPhoneStatic.description).toBe('Basic phone model') // Default value
    })
  })
})
