import { describe, it, expect } from 'vitest'
import { Money, Weight, KeyValueCache } from '../src/domain/shared/value-objects'
import { createMoney, createWeight } from './helpers/test-helpers'

describe('Test Setup Verification', () => {
  it('should be able to import and use value objects', () => {
    const money: Money = createMoney({ amount: 100, currency: 'USD' })
    const weight: Weight = createWeight({ value: 50, unit: 'kg' })
    
    expect(money.amount).toBe(100)
    expect(money.currency).toBe('USD')
    expect(weight.value).toBe(50)
    expect(weight.unit).toBe('kg')
  })

  it('should be able to use KeyValueCache', () => {
    const cache = new KeyValueCache<string, number>()
    
    cache.set('test', 42)
    expect(cache.get('test')).toBe(42)
    expect(cache.get('missing')).toBeUndefined()
    
    cache.set('test', 100) // Should replace existing
    expect(cache.get('test')).toBe(100)
    
    expect(cache.getOrderedValues()).toEqual([100])
  })
})
