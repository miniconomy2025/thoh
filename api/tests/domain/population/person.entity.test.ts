import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Person } from '../../../src/domain/population/person.entity'
import { Phone } from '../../../src/domain/population/phone.entity'
import { createPerson, createPhone } from '../../helpers/test-helpers'

describe('Person Entity', () => {
  describe('constructor', () => {
    it('should create person with required salary', () => {
      const person = new Person(50000)
      
      expect(person.salary).toBe(50000)
      expect(person.phone).toBeNull()
      expect(person.isAlive).toBe(true)
      expect(person.accountNumber).toBeNull()
    })

    it('should create person with all parameters', () => {
      const phone = createPhone()
      const person = new Person(75000, phone, false, '123456789')
      
      expect(person.salary).toBe(75000)
      expect(person.phone).toBe(phone)
      expect(person.isAlive).toBe(false)
      expect(person.accountNumber).toBe('123456789')
    })

    it('should use default values for optional parameters', () => {
      const person = new Person(60000)
      
      expect(person.salary).toBe(60000)
      expect(person.phone).toBeNull()
      expect(person.isAlive).toBe(true)
      expect(person.accountNumber).toBeNull()
    })
  })

  describe('salary property', () => {
    let person: Person

    beforeEach(() => {
      person = new Person(50000)
    })

    describe('getter', () => {
      it('should return the salary value', () => {
        expect(person.salary).toBe(50000)
      })

      it('should return updated salary after setter', () => {
        person.salary = 75000
        expect(person.salary).toBe(75000)
      })
    })

    describe('setter', () => {
      it('should update the salary', () => {
        person.salary = 100000
        
        expect(person.salary).toBe(100000)
      })

      it('should allow setting salary to zero', () => {
        person.salary = 0
        
        expect(person.salary).toBe(0)
      })

    })
  })

  describe('phone property', () => {
    let person: Person

    beforeEach(() => {
      person = new Person(50000)
    })

    it('should be null by default', () => {
      expect(person.phone).toBeNull()
    })

    it('should accept Phone instance', () => {
      const phone = createPhone()
      person.phone = phone
      
      expect(person.phone).toBe(phone)
    })

    it('should accept null', () => {
      const phone = createPhone()
      person.phone = phone
      person.phone = null
      
      expect(person.phone).toBeNull()
    })
  })

  describe('isAlive property', () => {
    let person: Person

    beforeEach(() => {
      person = new Person(50000)
    })

    it('should be true by default', () => {
      expect(person.isAlive).toBe(true)
    })

    it('should be mutable', () => {
      person.isAlive = false
      expect(person.isAlive).toBe(false)
      
      person.isAlive = true
      expect(person.isAlive).toBe(true)
    })
  })

  describe('accountNumber property', () => {
    let person: Person

    beforeEach(() => {
      person = new Person(50000)
    })

    it('should be null by default', () => {
      expect(person.accountNumber).toBeNull()
    })

    it('should accept string value', () => {
      person.accountNumber = '123456789'
      expect(person.accountNumber).toBe('123456789')
    })

    it('should accept null', () => {
      person.accountNumber = '123456789'
      person.accountNumber = null
      expect(person.accountNumber).toBeNull()
    })

    it('should accept empty string', () => {
      person.accountNumber = ''
      expect(person.accountNumber).toBe('')
    })
  })

  describe('id property', () => {
    let person: Person

    beforeEach(() => {
      person = new Person(50000)
    })

    it('should be undefined initially', () => {
      expect(person.id).toBeUndefined()
    })

    it('should be settable', () => {
      person.id = 42
      expect(person.id).toBe(42)
    })
  })

  describe('integration scenarios', () => {
    it('should handle person lifecycle with phone', () => {
      const person = new Person(50000)
      
      // Initially no phone
      expect(person.phone).toBeNull()
      
      // Assign phone
      const phone = createPhone()
      person.phone = phone
      expect(person.phone).toBe(phone)
      
      // Remove phone
      person.phone = null
      expect(person.phone).toBeNull()
    })

    it('should handle person with account number', () => {
      const person = new Person(50000, null, true, '987654321')
      
      expect(person.accountNumber).toBe('987654321')
      expect(person.isAlive).toBe(true)
      expect(person.salary).toBe(50000)
    })

    it('should handle salary changes', () => {
      const person = new Person(50000)
      
      // Initial salary
      expect(person.salary).toBe(50000)
      
      // Salary increase
      person.salary = 75000
      expect(person.salary).toBe(75000)
      
      // Salary decrease
      person.salary = 40000
      expect(person.salary).toBe(40000)
    })
  })
})
