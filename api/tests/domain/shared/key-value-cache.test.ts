import { describe, it, expect, beforeEach } from 'vitest'
import { KeyValueCache } from '../../../src/domain/shared/value-objects'
import { Money, Weight, Month, Day, WeekDay, Chart } from '../../../src/domain/shared/value-objects'

describe('KeyValueCache', () => {
  let cache: KeyValueCache<string, number>

  beforeEach(() => {
    cache = new KeyValueCache<string, number>()
  })

  describe('set and get operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 42)
      cache.set('key2', 100)
      
      expect(cache.get('key1')).toBe(42)
      expect(cache.get('key2')).toBe(100)
    })

    it('should return undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should replace existing keys when set is called again', () => {
      cache.set('key1', 42)
      cache.set('key1', 100) // Should replace existing
      
      expect(cache.get('key1')).toBe(100)
    })

    it('should handle different key types', () => {
      const stringCache = new KeyValueCache<string, string>()
      const numberCache = new KeyValueCache<number, boolean>()
      
      stringCache.set('test', 'value')
      numberCache.set(123, true)
      
      expect(stringCache.get('test')).toBe('value')
      expect(numberCache.get(123)).toBe(true)
    })
  })

  describe('getOrderedValues', () => {
    it('should return all values in insertion order', () => {
      cache.set('first', 1)
      cache.set('second', 2)
      cache.set('third', 3)
      
      expect(cache.getOrderedValues()).toEqual([1, 2, 3])
    })

    it('should return empty array when cache is empty', () => {
      expect(cache.getOrderedValues()).toEqual([])
    })

    it('should move replaced key to end of order', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key1', 10) // Replace first key - should move to end
      
      expect(cache.getOrderedValues()).toEqual([2, 10])
    })
  })

  describe('with complex value types', () => {
    it('should work with Money objects', () => {
      const moneyCache = new KeyValueCache<string, Money>()
      const money1: Money = { amount: 100, currency: 'USD' }
      const money2: Money = { amount: 200, currency: 'EUR' }
      
      moneyCache.set('usd', money1)
      moneyCache.set('eur', money2)
      
      expect(moneyCache.get('usd')).toEqual(money1)
      expect(moneyCache.get('eur')).toEqual(money2)
    })

    it('should work with Chart objects', () => {
      const chartCache = new KeyValueCache<Month, Chart>()
      const chart1: Chart = { measure: 'Monday', collections: 5, purchases: 3 }
      const chart2: Chart = { measure: 'Tuesday', collections: 7, purchases: 4 }
      
      chartCache.set('January', chart1)
      chartCache.set('February', chart2)
      
      expect(chartCache.get('January')).toEqual(chart1)
      expect(chartCache.get('February')).toEqual(chart2)
    })
  })
})
