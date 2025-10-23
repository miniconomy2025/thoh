import 'reflect-metadata'
import { vi } from 'vitest'
import { Money, Weight, Month, Day, WeekDay } from '../../src/domain/shared/value-objects'
import { Person } from '../../src/domain/population/person.entity'
import { Phone } from '../../src/domain/population/phone.entity'
import { PhoneStatic } from '../../src/domain/population/phone-static.entity'
import { Machine } from '../../src/domain/market/equipment.entity'
import { Truck } from '../../src/domain/market/equipment.entity'
import { Simulation } from '../../src/domain/simulation/simulation.entity'
import { RawMaterial } from '../../src/domain/market/raw-material.entity'
import { Order } from '../../src/domain/market/order.entity'
import { Collection } from '../../src/domain/market/collection.entity'
import { Recycle } from '../../src/domain/population/recycle.entity'
import { Population } from '../../src/domain/population/population.entity'
import { Currency } from '../../src/domain/population/currency.entity'

// Time and Randomness Helpers
export const mockTime = (fixedDate: Date) => {
  vi.useFakeTimers()
  vi.setSystemTime(fixedDate)
}

export const mockRandom = (values: number[]) => {
  let index = 0
  vi.spyOn(Math, 'random').mockImplementation(() => values[index++ % values.length])
}

export const mockRandomSequence = (...values: number[]) => {
  let index = 0
  vi.spyOn(Math, 'random').mockImplementation(() => values[index++])
}

// Factory Functions
export const createMoney = (overrides: Partial<Money> = {}): Money => ({
  amount: 1000,
  currency: 'ZAR',
  ...overrides
})

export const createWeight = (overrides: Partial<Weight> = {}): Weight => ({
  value: 100,
  unit: 'kg',
  ...overrides
})

export const createPhoneStatic = (overrides: Partial<PhoneStatic> = {}): PhoneStatic => {
  const phoneStatic = new PhoneStatic()
  phoneStatic.id = overrides.id ?? 1
  phoneStatic.name = overrides.name ?? 'ePhone'
  phoneStatic.description = overrides.description !== undefined ? overrides.description : 'Basic phone model'
  return phoneStatic
}

export const createPhone = (overrides: Partial<Phone> = {}): Phone => {
  const phone = new Phone()
  phone.id = overrides.id ?? 1
  phone.model = overrides.model ?? createPhoneStatic()
  phone.isBroken = overrides.isBroken ?? false
  return phone
}

export const createPerson = (overrides: Partial<Person> = {}): Person => {
  // Handle undefined salary by creating a person with a default salary first, then overriding
  const defaultSalary = overrides.salary !== undefined ? overrides.salary : 50000
  const person = new Person(
    defaultSalary,
    overrides.phone ?? null,
    overrides.isAlive ?? true,
    overrides.accountNumber ?? null
  )
  if (overrides.id) person.id = overrides.id
  // If salary was explicitly undefined, set it to undefined after construction
  if (overrides.salary === undefined) {
    (person as any)._salary = undefined
  }
  return person
}

export const createMachine = (overrides: Partial<Machine> = {}): Machine => {
  return new Machine(
    overrides.machineStaticId ?? 1,
    overrides.cost ?? createMoney(),
    overrides.weight ?? createWeight(),
    overrides.materialRatio ?? { copper: 2, plastic: 1 },
    overrides.productionRate ?? 500,
    overrides.quantity ?? 1,
    overrides.id ?? 1,
    overrides.sold ?? false
  )
}

export const createTruck = (overrides: Partial<Truck> = {}): Truck => {
  return new Truck(
    overrides.vehicleStaticId ?? 1,
    overrides.cost ?? createMoney(),
    overrides.weight ?? createWeight(),
    overrides.operatingCostPerDay ?? createMoney({ amount: 500 }),
    overrides.quantity ?? 1,
    overrides.id ?? 1,
    overrides.sold ?? false
  )
}

export const createSimulation = (overrides: Partial<Simulation> = {}): Simulation => {
  const simulation = new Simulation()
  simulation.id = overrides.id ?? 1
  simulation.simulationId = overrides.simulationId ?? 1
  simulation.status = overrides.status ?? 'not_started'
  simulation.currentDay = overrides.currentDay ?? 0
  simulation.startDate = overrides.startDate ?? new Date('2024-01-01')
  simulation.unixEpochStartTime = overrides.unixEpochStartTime ?? Date.now()
  return simulation
}

export const createRawMaterial = (overrides: Partial<RawMaterial> = {}): RawMaterial => {
  return new RawMaterial(
    overrides.material_static_id ?? 1,
    overrides.costPerKg ?? 100.50,
    overrides.availableWeight ?? 1000.0
  )
}

export const createOrder = (overrides: Partial<Order> = {}): Order => {
  const order = new Order()
  order.id = overrides.id ?? 1
  order.itemName = overrides.itemName ?? 'Test Item'
  order.quantity = overrides.quantity ?? 10
  order.unitPrice = overrides.unitPrice ?? 50.00
  order.totalPrice = overrides.totalPrice ?? 500.00
  order.currency = overrides.currency ?? 'ZAR'
  order.orderDate = overrides.orderDate ?? new Date('2024-01-01')
  order.status = overrides.status ?? 'pending'
  order.itemId = overrides.itemId ?? 1
  order.item_type_id = overrides.item_type_id ?? 1
  order.marketId = overrides.marketId ?? 1
  return order
}

export const createCollection = (overrides: Partial<Collection> = {}): Collection => {
  const collection = new Collection()
  collection.id = overrides.id ?? 1
  collection.orderId = overrides.orderId ?? 1
  collection.itemName = overrides.itemName ?? 'Test Item'
  collection.itemId = overrides.itemId ?? 1
  collection.quantity = overrides.quantity !== undefined ? overrides.quantity : 10
  collection.amountCollected = overrides.amountCollected !== undefined ? overrides.amountCollected : 0
  collection.orderDate = overrides.orderDate ?? new Date('2024-01-01')
  collection.collected = overrides.collected ?? false
  collection.collectionDate = overrides.collectionDate !== undefined ? overrides.collectionDate : null
  return collection
}

export const createRecycle = (overrides: Partial<Recycle> = {}): Recycle => {
  const recycle = new Recycle()
  recycle.id = overrides.id ?? 1
  recycle.phone = overrides.phone ?? createPhone()
  recycle.brokenAt = overrides.brokenAt ?? new Date('2024-01-01')
  return recycle
}

export const createPopulation = (overrides: Partial<Population> = {}): Population => {
  const population = new Population()
  population.id = overrides.id ?? 1
  population.simulationId = overrides.simulationId !== undefined ? overrides.simulationId : 1
  population.simulation = overrides.simulation !== undefined ? overrides.simulation : null
  return population
}

export const createCurrency = (overrides: Partial<Currency> = {}): Currency => {
  const currency = new Currency()
  currency.code = overrides.code ?? 'ZAR'
  currency.description = overrides.description !== undefined ? overrides.description : 'South African Rand'
  return currency
}

// Test Data Constants
export const TEST_DATES = {
  JANUARY_1_2024: new Date('2024-01-01T00:00:00Z'),
  JANUARY_15_2024: new Date('2024-01-15T12:00:00Z'),
  FEBRUARY_1_2024: new Date('2024-02-01T00:00:00Z'),
  MARCH_1_2024: new Date('2024-03-01T00:00:00Z'),
} as const

export const TEST_RANDOM_VALUES = {
  LOW: 0.1,
  MEDIUM: 0.5,
  HIGH: 0.9,
  ZERO: 0.0,
  ONE: 1.0,
} as const

// Assertion Helpers
export const expectMoney = (actual: Money, expected: Money) => {
  expect(actual.amount).toBe(expected.amount)
  expect(actual.currency).toBe(expected.currency)
}

export const expectWeight = (actual: Weight, expected: Weight) => {
  expect(actual.value).toBe(expected.value)
  expect(actual.unit).toBe(expected.unit)
}

export const expectDateCloseTo = (actual: Date, expected: Date, toleranceMs: number = 1000) => {
  const diff = Math.abs(actual.getTime() - expected.getTime())
  expect(diff).toBeLessThanOrEqual(toleranceMs)
}
