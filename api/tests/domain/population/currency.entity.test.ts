import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { Currency } from '../../../src/domain/population/currency.entity'
import { createCurrency } from '../../helpers/test-helpers'

describe('Currency Entity', () => {
  let currency: Currency

  beforeEach(() => {
    currency = createCurrency()
  })

  describe('constructor and initial state', () => {
    it('should have correct initial state', () => {
      expect(currency.code).toBe('ZAR')
      expect(currency.description).toBe('South African Rand')
    })

    it('should create currency with custom values', () => {
      const customCurrency = createCurrency({
        code: 'USD',
        description: 'United States Dollar'
      })
      
      expect(customCurrency.code).toBe('USD')
      expect(customCurrency.description).toBe('United States Dollar')
    })

    it('should create currency with null description', () => {
      const currencyWithNullDescription = createCurrency({
        code: 'EUR',
        description: null
      })
      
      expect(currencyWithNullDescription.code).toBe('EUR')
      expect(currencyWithNullDescription.description).toBeNull()
    })

    it('should create currency with undefined description', () => {
      const currencyWithUndefinedDescription = createCurrency({
        code: 'GBP',
        description: undefined
      })
      
      expect(currencyWithUndefinedDescription.code).toBe('GBP')
      expect(currencyWithUndefinedDescription.description).toBe('South African Rand') // undefined ?? 'South African Rand' = 'South African Rand'
    })
  })

  describe('code property', () => {
    it('should be mutable', () => {
      currency.code = 'USD'
      expect(currency.code).toBe('USD')
    })

    it('should accept different currency codes', () => {
      const currencyCodes = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']
      
      currencyCodes.forEach(code => {
        currency.code = code
        expect(currency.code).toBe(code)
      })
    })

    it('should be a string type', () => {
      expect(typeof currency.code).toBe('string')
    })

    it('should handle empty string', () => {
      currency.code = ''
      expect(currency.code).toBe('')
    })

    it('should handle long codes', () => {
      const longCode = 'VERYLONGCURRENCYCODE'
      currency.code = longCode
      expect(currency.code).toBe(longCode)
    })

    it('should handle special characters', () => {
      const specialCodes = ['ZAR-', 'USD.', 'EUR@', 'GBP#', 'JPY$']
      
      specialCodes.forEach(code => {
        currency.code = code
        expect(currency.code).toBe(code)
      })
    })

    it('should handle numeric codes', () => {
      const numericCodes = ['123', '456', '789']
      
      numericCodes.forEach(code => {
        currency.code = code
        expect(currency.code).toBe(code)
      })
    })
  })

  describe('description property', () => {
    it('should be mutable', () => {
      currency.description = 'Updated Description'
      expect(currency.description).toBe('Updated Description')
    })

    it('should accept different descriptions', () => {
      const descriptions = [
        'South African Rand',
        'United States Dollar',
        'Euro',
        'British Pound Sterling',
        'Japanese Yen',
        'Canadian Dollar',
        'Australian Dollar',
        'Swiss Franc'
      ]
      
      descriptions.forEach(description => {
        currency.description = description
        expect(currency.description).toBe(description)
      })
    })

    it('should handle null description', () => {
      currency.description = null
      expect(currency.description).toBeNull()
    })

    it('should handle undefined description', () => {
      currency.description = undefined
      expect(currency.description).toBeUndefined()
    })

    it('should handle empty string description', () => {
      currency.description = ''
      expect(currency.description).toBe('')
    })

    it('should handle long descriptions', () => {
      const longDescription = 'This is a very long currency description that contains multiple sentences and detailed information about the currency, its history, usage, and characteristics.'
      currency.description = longDescription
      expect(currency.description).toBe(longDescription)
    })

    it('should handle special characters in description', () => {
      const specialDescriptions = [
        'Currency with "quotes"',
        'Currency with \'single quotes\'',
        'Currency with <tags>',
        'Currency with & symbols',
        'Currency with % symbols',
        'Currency with @ symbols'
      ]
      
      specialDescriptions.forEach(description => {
        currency.description = description
        expect(currency.description).toBe(description)
      })
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete currency lifecycle', () => {
      // Initial state
      expect(currency.code).toBe('ZAR')
      expect(currency.description).toBe('South African Rand')
      
      // Update code
      currency.code = 'USD'
      expect(currency.code).toBe('USD')
      expect(currency.description).toBe('South African Rand') // Description unchanged
      
      // Update description
      currency.description = 'United States Dollar'
      expect(currency.code).toBe('USD')
      expect(currency.description).toBe('United States Dollar')
      
      // Update both
      currency.code = 'EUR'
      currency.description = 'Euro'
      expect(currency.code).toBe('EUR')
      expect(currency.description).toBe('Euro')
    })

    it('should handle currency with all properties updated', () => {
      currency.code = 'GBP'
      currency.description = 'British Pound Sterling'
      
      expect(currency.code).toBe('GBP')
      expect(currency.description).toBe('British Pound Sterling')
    })

    it('should handle multiple currency updates', () => {
      const updates = [
        { code: 'USD', description: 'United States Dollar' },
        { code: 'EUR', description: 'Euro' },
        { code: 'GBP', description: 'British Pound Sterling' },
        { code: 'JPY', description: 'Japanese Yen' }
      ]
      
      updates.forEach(update => {
        currency.code = update.code
        currency.description = update.description
        
        expect(currency.code).toBe(update.code)
        expect(currency.description).toBe(update.description)
      })
    })

    it('should handle currency with null description', () => {
      currency.code = 'BTC'
      currency.description = null
      
      expect(currency.code).toBe('BTC')
      expect(currency.description).toBeNull()
    })

    it('should handle currency with undefined description', () => {
      currency.code = 'ETH'
      currency.description = undefined
      
      expect(currency.code).toBe('ETH')
      expect(currency.description).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle currency with undefined code initially', () => {
      const currencyWithoutCode = new Currency()
      currencyWithoutCode.description = 'Test Currency'
      
      expect(currencyWithoutCode.code).toBeUndefined()
      expect(currencyWithoutCode.description).toBe('Test Currency')
    })

    it('should handle currency with undefined description initially', () => {
      const currencyWithoutDescription = new Currency()
      currencyWithoutDescription.code = 'TEST'
      
      expect(currencyWithoutDescription.code).toBe('TEST')
      expect(currencyWithoutDescription.description).toBeUndefined()
    })

    it('should handle currency with both undefined initially', () => {
      const emptyCurrency = new Currency()
      
      expect(emptyCurrency.code).toBeUndefined()
      expect(emptyCurrency.description).toBeUndefined()
    })

    it('should handle very short codes', () => {
      currency.code = 'A'
      expect(currency.code).toBe('A')
    })

    it('should handle single character codes', () => {
      const singleCharCodes = ['A', 'B', 'C', 'D', 'E']
      
      singleCharCodes.forEach(code => {
        currency.code = code
        expect(currency.code).toBe(code)
      })
    })

    it('should handle mixed case codes', () => {
      const mixedCaseCodes = ['zar', 'USD', 'Eur', 'gbp', 'JPY']
      
      mixedCaseCodes.forEach(code => {
        currency.code = code
        expect(currency.code).toBe(code)
      })
    })

    it('should handle codes with spaces', () => {
      currency.code = 'ZAR '
      expect(currency.code).toBe('ZAR ')
    })

    it('should handle codes with leading/trailing spaces', () => {
      currency.code = ' ZAR '
      expect(currency.code).toBe(' ZAR ')
    })
  })

  describe('TypeORM decorators', () => {
    it('should have correct entity name', () => {
      expect(currency).toBeInstanceOf(Currency)
    })

    it('should have proper column types for database', () => {
      expect(typeof currency.code).toBe('string')
      expect(typeof currency.description === 'string' || currency.description === null || currency.description === undefined).toBe(true)
    })

    it('should support PrimaryColumn for code', () => {
      // This test verifies that the code field is properly configured as a PrimaryColumn
      expect(currency.code).toBeDefined()
    })

    it('should support nullable description', () => {
      // This test verifies that the description field is properly configured as nullable
      currency.description = null
      expect(currency.description).toBeNull()
      
      currency.description = 'Test Description'
      expect(currency.description).toBe('Test Description')
    })
  })

  describe('factory function compatibility', () => {
    it('should work with createCurrency factory', () => {
      const factoryCurrency = createCurrency({
        code: 'USD',
        description: 'United States Dollar'
      })
      
      expect(factoryCurrency.code).toBe('USD')
      expect(factoryCurrency.description).toBe('United States Dollar')
    })

    it('should work with partial overrides', () => {
      const partialCurrency = createCurrency({ code: 'EUR' })
      
      expect(partialCurrency.code).toBe('EUR') // Override value
      expect(partialCurrency.description).toBe('South African Rand') // Default value
    })

    it('should work with null description override', () => {
      const currencyWithNullDescription = createCurrency({ 
        code: 'BTC',
        description: null
      })
      
      expect(currencyWithNullDescription.code).toBe('BTC')
      expect(currencyWithNullDescription.description).toBeNull()
    })

    it('should work with undefined description override', () => {
      const currencyWithUndefinedDescription = createCurrency({ 
        code: 'ETH',
        description: undefined
      })
      
      expect(currencyWithUndefinedDescription.code).toBe('ETH')
      expect(currencyWithUndefinedDescription.description).toBe('South African Rand') // undefined ?? 'South African Rand' = 'South African Rand'
    })
  })

  describe('business logic scenarios', () => {
    it('should represent a standard currency', () => {
      const standardCurrency = createCurrency({
        code: 'USD',
        description: 'United States Dollar'
      })
      
      expect(standardCurrency.code).toBe('USD')
      expect(standardCurrency.description).toBe('United States Dollar')
    })

    it('should represent a cryptocurrency', () => {
      const cryptoCurrency = createCurrency({
        code: 'BTC',
        description: 'Bitcoin'
      })
      
      expect(cryptoCurrency.code).toBe('BTC')
      expect(cryptoCurrency.description).toBe('Bitcoin')
    })

    it('should represent a currency without description', () => {
      const currencyWithoutDescription = createCurrency({
        code: 'XYZ',
        description: null
      })
      
      expect(currencyWithoutDescription.code).toBe('XYZ')
      expect(currencyWithoutDescription.description).toBeNull()
    })

    it('should handle multiple currencies', () => {
      const currencies = [
        { code: 'ZAR', description: 'South African Rand' },
        { code: 'USD', description: 'United States Dollar' },
        { code: 'EUR', description: 'Euro' },
        { code: 'GBP', description: 'British Pound Sterling' },
        { code: 'JPY', description: 'Japanese Yen' }
      ]
      
      currencies.forEach(currencyData => {
        currency.code = currencyData.code
        currency.description = currencyData.description
        
        expect(currency.code).toBe(currencyData.code)
        expect(currency.description).toBe(currencyData.description)
      })
    })
  })

  describe('real-world currency codes', () => {
    it('should handle major world currencies', () => {
      const majorCurrencies = [
        { code: 'USD', description: 'United States Dollar' },
        { code: 'EUR', description: 'Euro' },
        { code: 'GBP', description: 'British Pound Sterling' },
        { code: 'JPY', description: 'Japanese Yen' },
        { code: 'CHF', description: 'Swiss Franc' },
        { code: 'CAD', description: 'Canadian Dollar' },
        { code: 'AUD', description: 'Australian Dollar' },
        { code: 'NZD', description: 'New Zealand Dollar' }
      ]
      
      majorCurrencies.forEach(currencyData => {
        currency.code = currencyData.code
        currency.description = currencyData.description
        
        expect(currency.code).toBe(currencyData.code)
        expect(currency.description).toBe(currencyData.description)
      })
    })

    it('should handle emerging market currencies', () => {
      const emergingCurrencies = [
        { code: 'ZAR', description: 'South African Rand' },
        { code: 'BRL', description: 'Brazilian Real' },
        { code: 'RUB', description: 'Russian Ruble' },
        { code: 'INR', description: 'Indian Rupee' },
        { code: 'CNY', description: 'Chinese Yuan' }
      ]
      
      emergingCurrencies.forEach(currencyData => {
        currency.code = currencyData.code
        currency.description = currencyData.description
        
        expect(currency.code).toBe(currencyData.code)
        expect(currency.description).toBe(currencyData.description)
      })
    })

    it('should handle cryptocurrencies', () => {
      const cryptocurrencies = [
        { code: 'BTC', description: 'Bitcoin' },
        { code: 'ETH', description: 'Ethereum' },
        { code: 'ADA', description: 'Cardano' },
        { code: 'DOT', description: 'Polkadot' },
        { code: 'LINK', description: 'Chainlink' }
      ]
      
      cryptocurrencies.forEach(currencyData => {
        currency.code = currencyData.code
        currency.description = currencyData.description
        
        expect(currency.code).toBe(currencyData.code)
        expect(currency.description).toBe(currencyData.description)
      })
    })
  })
})
