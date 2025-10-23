import { IQueueService } from '../../src/infrastructure/queue/queue.interface'
import { ISimulationRepository, IMarketRepository, IPopulationRepository } from '../../src/application/ports/repository.ports'
import { Simulation } from '../../src/domain/simulation/simulation.entity'
import { Person } from '../../src/domain/population/person.entity'
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../src/domain/market/market.aggregate'

// Mock Queue Service
export class MockQueueService implements IQueueService {
  private messages: Array<{
    body: any
    messageGroupId?: string
    attributes?: any
  }> = []

  async sendMessage(params: {
    body: any
    messageGroupId?: string
    attributes?: any
  }): Promise<void> {
    this.messages.push(params)
  }

  getMessages() {
    return [...this.messages]
  }

  getMessagesByType(type: string) {
    return this.messages.filter(msg => msg.body.type === type)
  }

  clear() {
    this.messages = []
  }

  getMessageCount() {
    return this.messages.length
  }
}

// Mock Simulation Repository
export class MockSimulationRepository implements ISimulationRepository {
  private simulations = new Map<number, Simulation>()
  private nextId = 1

  async findById(id: number): Promise<Simulation | null> {
    return this.simulations.get(id) || null
  }

  async save(simulation: Simulation): Promise<number> {
    if (!simulation.id) {
      simulation.id = this.nextId++
    }
    this.simulations.set(simulation.id, simulation)
    return simulation.id
  }

  async findAll(): Promise<Simulation[]> {
    return Array.from(this.simulations.values())
  }

  clear() {
    this.simulations.clear()
    this.nextId = 1
  }

  getSimulationCount() {
    return this.simulations.size
  }
}

// Mock Market Repository
export class MockMarketRepository implements IMarketRepository {
  private rawMaterialsMarket: RawMaterialsMarket | null = null
  private machinesMarket: MachinesMarket | null = null
  private trucksMarket: TrucksMarket | null = null

  async findRawMaterialsMarket(): Promise<RawMaterialsMarket | null> {
    return this.rawMaterialsMarket
  }

  async findMachinesMarket(): Promise<MachinesMarket | null> {
    return this.machinesMarket
  }

  async findTrucksMarket(): Promise<TrucksMarket | null> {
    return this.trucksMarket
  }

  async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
    this.rawMaterialsMarket = market
  }

  async saveMachinesMarket(market: MachinesMarket): Promise<void> {
    this.machinesMarket = market
  }

  async saveTrucksMarket(market: TrucksMarket): Promise<void> {
    this.trucksMarket = market
  }

  setRawMaterialsMarket(market: RawMaterialsMarket) {
    this.rawMaterialsMarket = market
  }

  setMachinesMarket(market: MachinesMarket) {
    this.machinesMarket = market
  }

  setTrucksMarket(market: TrucksMarket) {
    this.trucksMarket = market
  }

  clear() {
    this.rawMaterialsMarket = null
    this.machinesMarket = null
    this.trucksMarket = null
  }
}

// Mock Population Repository
export class MockPopulationRepository implements IPopulationRepository {
  private people = new Map<number, Person>()
  private nextId = 1

  async findById(id: number): Promise<Person | null> {
    return this.people.get(id) || null
  }

  async findAll(): Promise<Person[]> {
    return Array.from(this.people.values())
  }

  async save(person: Person): Promise<number> {
    if (!person.id) {
      person.id = this.nextId++
    }
    this.people.set(person.id, person)
    return person.id
  }

  async updatePerson(person: Person): Promise<void> {
    if (person.id) {
      this.people.set(person.id, person)
    }
  }

  async findByAccountNumber(accountNumber: string): Promise<Person | null> {
    for (const person of this.people.values()) {
      if (person.accountNumber === accountNumber) {
        return person
      }
    }
    return null
  }

  clear() {
    this.people.clear()
    this.nextId = 1
  }

  getPersonCount() {
    return this.people.size
  }
}

