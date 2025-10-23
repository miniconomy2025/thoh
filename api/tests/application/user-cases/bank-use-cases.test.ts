import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GetBankInitializationUseCase } from '../../../src/application/user-cases/get-bank-initialization.use-case'
import { UpdateBankPrimeRateUseCase } from '../../../src/application/user-cases/update-bank-prime-rate.use-case'
import { mockRandomSequence, TEST_RANDOM_VALUES } from '../../helpers/test-helpers'

describe('Bank Use Cases', () => {
  describe('GetBankInitializationUseCase', () => {
    let useCase: GetBankInitializationUseCase

    beforeEach(() => {
      useCase = new GetBankInitializationUseCase()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    describe('execute method', () => {
      it('should return primeRate between 4.00 and 16.00', () => {
        const result = useCase.execute()
        
        expect(result.primeRate).toBeGreaterThanOrEqual(4.00)
        expect(result.primeRate).toBeLessThanOrEqual(16.00)
        expect(result.primeRate).toBeTypeOf('number')
      })

      it('should return investmentValue between 10B and 100B', () => {
        const result = useCase.execute()
        
        expect(result.investmentValue).toBeGreaterThanOrEqual(10_000_000_000)
        expect(result.investmentValue).toBeLessThanOrEqual(100_000_000_000)
        expect(result.investmentValue).toBeTypeOf('number')
      })

      it('should return integer investmentValue', () => {
        const result = useCase.execute()
        
        expect(Number.isInteger(result.investmentValue)).toBe(true)
      })

      it('should return primeRate with 2 decimal places', () => {
        const result = useCase.execute()
        
        const decimalPlaces = (result.primeRate.toString().split('.')[1] || '').length
        expect(decimalPlaces).toBeLessThanOrEqual(2)
      })

      it('should generate different values on multiple calls', () => {
        const results = Array.from({ length: 10 }, () => useCase.execute())
        
        const primeRates = results.map(r => r.primeRate)
        const investmentValues = results.map(r => r.investmentValue)
        
        // Should have some variation (very unlikely all 10 are identical)
        const uniquePrimeRates = new Set(primeRates)
        const uniqueInvestmentValues = new Set(investmentValues)
        
        expect(uniquePrimeRates.size).toBeGreaterThan(1)
        expect(uniqueInvestmentValues.size).toBeGreaterThan(1)
      })
    })

    describe('with mocked random values', () => {
      it('should return minimum values when random is 0', () => {
        mockRandomSequence(0, 0)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(4.00)
        expect(result.investmentValue).toBe(10_000_000_000)
      })

      it('should return maximum values when random is 1', () => {
        mockRandomSequence(1, 1)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(16.00)
        expect(result.investmentValue).toBe(100_000_000_001)
      })

      it('should return middle values when random is 0.5', () => {
        mockRandomSequence(0.5, 0.5)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(10.00) // 4 + (16-4) * 0.5
        expect(result.investmentValue).toBe(55_000_000_000) // 10B + (100B-10B) * 0.5
      })
    })
  })

  describe('UpdateBankPrimeRateUseCase', () => {
    let useCase: UpdateBankPrimeRateUseCase

    beforeEach(() => {
      useCase = new UpdateBankPrimeRateUseCase()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    describe('execute method', () => {
      it('should return primeRate between 4.00 and 16.00', () => {
        const result = useCase.execute()
        
        expect(result.primeRate).toBeGreaterThanOrEqual(4.00)
        expect(result.primeRate).toBeLessThanOrEqual(16.00)
        expect(result.primeRate).toBeTypeOf('number')
      })

      it('should return primeRate with 2 decimal places', () => {
        const result = useCase.execute()
        
        const decimalPlaces = (result.primeRate.toString().split('.')[1] || '').length
        expect(decimalPlaces).toBeLessThanOrEqual(2)
      })

      it('should generate different values on multiple calls', () => {
        const results = Array.from({ length: 10 }, () => useCase.execute())
        
        const primeRates = results.map(r => r.primeRate)
        const uniquePrimeRates = new Set(primeRates)
        
        // Should have some variation
        expect(uniquePrimeRates.size).toBeGreaterThan(1)
      })

      it('should return only primeRate property', () => {
        const result = useCase.execute()
        
        expect(Object.keys(result)).toEqual(['primeRate'])
      })
    })

    describe('with mocked random values', () => {
      it('should return minimum rate when random is 0', () => {
        mockRandomSequence(0)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(4.00)
      })

      it('should return maximum rate when random is 1', () => {
        mockRandomSequence(1)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(16.00)
      })

      it('should return middle rate when random is 0.5', () => {
        mockRandomSequence(0.5)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(10.00) // 4 + (16-4) * 0.5
      })

      it('should handle fractional random values correctly', () => {
        mockRandomSequence(0.25)
        
        const result = useCase.execute()
        
        expect(result.primeRate).toBe(7.00) // 4 + (16-4) * 0.25
      })
    })
  })

  describe('comparison between use cases', () => {
    it('should have same primeRate range', () => {
      const getBankUseCase = new GetBankInitializationUseCase()
      const updateRateUseCase = new UpdateBankPrimeRateUseCase()
      
      const getBankResult = getBankUseCase.execute()
      const updateRateResult = updateRateUseCase.execute()
      
      expect(getBankResult.primeRate).toBeGreaterThanOrEqual(4.00)
      expect(getBankResult.primeRate).toBeLessThanOrEqual(16.00)
      expect(updateRateResult.primeRate).toBeGreaterThanOrEqual(4.00)
      expect(updateRateResult.primeRate).toBeLessThanOrEqual(16.00)
    })

    it('should have consistent decimal precision', () => {
      const getBankUseCase = new GetBankInitializationUseCase()
      const updateRateUseCase = new UpdateBankPrimeRateUseCase()
      
      const getBankResult = getBankUseCase.execute()
      const updateRateResult = updateRateUseCase.execute()
      
      const getBankDecimalPlaces = (getBankResult.primeRate.toString().split('.')[1] || '').length
      const updateRateDecimalPlaces = (updateRateResult.primeRate.toString().split('.')[1] || '').length
      
      expect(getBankDecimalPlaces).toBeLessThanOrEqual(2)
      expect(updateRateDecimalPlaces).toBeLessThanOrEqual(2)
    })
  })
})
