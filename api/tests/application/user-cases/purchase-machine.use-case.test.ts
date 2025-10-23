import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PurchaseMachineUseCase } from '../../../src/application/user-cases/purchase-machine.use-case'
import { Machine } from '../../../src/domain/market/equipment.entity'
import { createMachine, createMoney, createWeight } from '../../helpers/test-helpers'

// Mock repositories
const mockMarketRepo = {
  findMachinesMarket: vi.fn(),
  saveOrder: vi.fn()
}

const mockMachineStaticRepo = {
  findAll: vi.fn()
}

const mockItemTypeRepo = {
  findMachineTypeId: vi.fn()
}

// Mock the repositories
vi.mock('../../../src/infrastructure/persistence/postgres/machine-static.repository', () => ({
  MachineStaticRepository: vi.fn().mockImplementation(() => mockMachineStaticRepo)
}))

vi.mock('../../../src/infrastructure/persistence/postgres/item-type.repository', () => ({
  ItemTypeRepository: vi.fn().mockImplementation(() => mockItemTypeRepo)
}))

describe('PurchaseMachineUseCase', () => {
  let useCase: PurchaseMachineUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new PurchaseMachineUseCase(mockMarketRepo as any)
  })

  describe('execute', () => {
    it('should successfully purchase a machine', async () => {
      // Arrange
      const machine = createMachine({
        id: 1,
        machineStaticId: 1,
        cost: createMoney({ amount: 5000 }),
        weight: createWeight({ value: 200 }),
        materialRatio: { copper: 2, plastic: 1 },
        productionRate: 100,
        quantity: 1
      })

      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([machine])
      }

      const mockStaticMachine = {
        id: 1,
        name: 'Test Machine',
        description: 'A test machine'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Machine',
        quantity: 2,
        unitPrice: 5000,
        totalPrice: 10000,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 1,
        item_type_id: 1,
        orderDate: undefined
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([mockStaticMachine])
      mockItemTypeRepo.findMachineTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      // Act
      const result = await useCase.execute({
        machineName: 'Test Machine',
        quantity: 2,
        simulationDate: undefined
      })

      // Assert
      expect(result).toEqual({
        orderId: 1,
        machineName: 'Test Machine',
        totalPrice: 10000,
        unitWeight: 200,
        totalWeight: 400,
        quantity: 2,
        machineDetails: {
          requiredMaterials: 'copper, plastic',
          inputRatio: { copper: 2, plastic: 1 },
          productionRate: 100
        },
        bankAccount: '000000000000'
      })

      expect(mockMarketRepo.findMachinesMarket).toHaveBeenCalled()
      expect(mockMachineStaticRepo.findAll).toHaveBeenCalled()
      expect(mockItemTypeRepo.findMachineTypeId).toHaveBeenCalled()
      expect(mockMarketRepo.saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          itemName: 'Test Machine',
          quantity: 2,
          unitPrice: 5000,
          totalPrice: 10000,
          currency: 'ZAR',
          status: 'pending',
          itemId: 1,
          marketId: 1,
          item_type_id: 1
        })
      )
    })

    it('should throw error when machines market not found', async () => {
      // Arrange
      mockMarketRepo.findMachinesMarket.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute({
        machineName: 'Test Machine',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow('Machines market not found')
    })

    it('should throw error when machine not found in static table', async () => {
      // Arrange
      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([])
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([])

      // Act & Assert
      await expect(useCase.execute({
        machineName: 'NonExistent Machine',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow("Machine 'NonExistent Machine' not found in static table")
    })

    it('should throw error when machine not found in market', async () => {
      // Arrange
      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([])
      }

      const mockStaticMachine = {
        id: 1,
        name: 'Test Machine',
        description: 'A test machine'
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([mockStaticMachine])

      // Act & Assert
      await expect(useCase.execute({
        machineName: 'Test Machine',
        quantity: 1,
        simulationDate: undefined
      })).rejects.toThrow("Machine 'Test Machine' not found in market")
    })

    it('should handle simulation date when provided', async () => {
      // Arrange
      const machine = createMachine({
        id: 1,
        machineStaticId: 1,
        cost: createMoney({ amount: 5000 }),
        weight: createWeight({ value: 200 }),
        materialRatio: { copper: 2, plastic: 1 },
        productionRate: 100,
        quantity: 1
      })

      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([machine])
      }

      const mockStaticMachine = {
        id: 1,
        name: 'Test Machine',
        description: 'A test machine'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Machine',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 1,
        item_type_id: 1,
        orderDate: new Date('2024-01-01')
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([mockStaticMachine])
      mockItemTypeRepo.findMachineTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      const simulationDate = new Date('2024-01-01')

      // Act
      await useCase.execute({
        machineName: 'Test Machine',
        quantity: 1,
        simulationDate: simulationDate
      })

      // Assert
      expect(mockMarketRepo.saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderDate: simulationDate
        })
      )
    })

    it('should calculate correct total price for multiple quantities', async () => {
      // Arrange
      const machine = createMachine({
        id: 1,
        machineStaticId: 1,
        cost: createMoney({ amount: 3000 }),
        weight: createWeight({ value: 150 }),
        materialRatio: { copper: 3, plastic: 2 },
        productionRate: 150,
        quantity: 1
      })

      const mockMarket = {
        getMachinesForSale: vi.fn().mockReturnValue([machine])
      }

      const mockStaticMachine = {
        id: 1,
        name: 'Test Machine',
        description: 'A test machine'
      }

      const mockOrder = {
        id: 1,
        itemName: 'Test Machine',
        quantity: 3,
        unitPrice: 3000,
        totalPrice: 9000,
        currency: 'ZAR',
        status: 'pending',
        itemId: 1,
        marketId: 1,
        item_type_id: 1,
        orderDate: undefined
      }

      mockMarketRepo.findMachinesMarket.mockResolvedValue(mockMarket)
      mockMachineStaticRepo.findAll.mockResolvedValue([mockStaticMachine])
      mockItemTypeRepo.findMachineTypeId.mockResolvedValue(1)
      mockMarketRepo.saveOrder.mockResolvedValue(mockOrder)

      // Act
      const result = await useCase.execute({
        machineName: 'Test Machine',
        quantity: 3,
        simulationDate: undefined
      })

      // Assert
      expect(result.totalPrice).toBe(9000) // 3000 * 3
      expect(result.totalWeight).toBe(450) // 150 * 3
      expect(result.quantity).toBe(3)
      expect(result.machineDetails.inputRatio).toEqual({ copper: 3, plastic: 2 })
      expect(result.machineDetails.productionRate).toBe(150)
    })
  })
})
