import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getScaledDate, calculateDaysElapsed } from '../../src/infrastructure/utils'
import { Month, Day, WeekDay } from '../../src/domain/shared/value-objects'
import { TEST_DATES } from '../helpers/test-helpers'

describe('Utility Functions', () => {
  beforeEach(() => {
    // Use real timers for these tests
  })

  afterEach(() => {
    // Clean up any timer mocks
  })

  describe('getScaledDate', () => {
    it('should return correct month, day, and weekday for start date', () => {
      const start = TEST_DATES.JANUARY_1_2024 // Monday
      const now = TEST_DATES.JANUARY_1_2024
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('January')
      expect(result.day).toBe(1)
      expect(result.weekday).toBe('Monday')
    })

    it('should calculate correct scaled date after 2 minutes (1 simulated day)', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 2 * 60 * 1000) // +2 minutes
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('January')
      expect(result.day).toBe(2) // Day 2
      expect(result.weekday).toBe('Tuesday')
    })

    it('should calculate correct scaled date after 4 minutes (2 simulated days)', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 4 * 60 * 1000) // +4 minutes
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('January')
      expect(result.day).toBe(3) // Day 3
      expect(result.weekday).toBe('Wednesday')
    })

    it('should handle month transitions correctly', () => {
      const start = TEST_DATES.JANUARY_1_2024
      // 30.44 days * 2 minutes = ~60.88 minutes to next month
      const now = new Date(start.getTime() + 61 * 60 * 1000) // +61 minutes
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('February')
      expect(result.day).toBe(1)
    })

    it('should handle year transitions correctly', () => {
      const start = TEST_DATES.JANUARY_1_2024
      // 12 months * 30.44 days * 2 minutes = ~730.56 minutes to next year
      const now = new Date(start.getTime() + 731 * 60 * 1000) // +731 minutes
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('January')
      expect(result.day).toBe(1)
    })

    it('should maintain correct weekday progression', () => {
      const start = TEST_DATES.JANUARY_1_2024 // Monday
      
      // Test 7 days worth of progression
      for (let day = 0; day < 7; day++) {
        const now = new Date(start.getTime() + day * 2 * 60 * 1000)
        const result = getScaledDate(start, now)
        
        const expectedWeekdays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        expect(result.weekday).toBe(expectedWeekdays[day])
      }
    })

    it('should handle edge case of exactly 30.44 days', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 30.44 * 2 * 60 * 1000)
      
      const result = getScaledDate(start, now)
      
      expect(result.month).toBe('February')
      expect(result.day).toBe(1)
    })
  })

  describe('calculateDaysElapsed', () => {
    it('should return 1 for start date', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = TEST_DATES.JANUARY_1_2024
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(1)
    })

    it('should return 2 after 2 minutes (1 simulated day)', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 2 * 60 * 1000) // +2 minutes
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(2)
    })

    it('should return 3 after 4 minutes (2 simulated days)', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 4 * 60 * 1000) // +4 minutes
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(3)
    })

    it('should handle fractional days correctly', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 3 * 60 * 1000) // +3 minutes (1.5 days)
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(2) // Should floor to 2
    })

    it('should handle large time differences', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 100 * 2 * 60 * 1000) // +100 simulated days
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(101) // 100 days + 1 for start day
    })

    it('should handle edge case of exactly 2 minutes', () => {
      const start = TEST_DATES.JANUARY_1_2024
      const now = new Date(start.getTime() + 2 * 60 * 1000) // Exactly 2 minutes
      
      const result = calculateDaysElapsed(start, now)
      
      expect(result).toBe(2)
    })
  })
})

