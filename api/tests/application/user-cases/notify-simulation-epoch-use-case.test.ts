import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Environment variable will be set in beforeEach

// Mock modules before any imports
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => Buffer.from('mock-cert'))
  },
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => Buffer.from('mock-cert'))
}))

vi.mock('node:path', () => ({
  default: {
    join: vi.fn(() => '/mock/path')
  },
  join: vi.fn(() => '/mock/path')
}))

vi.mock('undici', () => ({
  fetch: vi.fn(),
  Agent: vi.fn()
}))

vi.mock('../../../src/infrastructure/config/epoch-notification.config', () => ({
  epochNotificationConfig: {
    epochNotificationUrls: [
      'https://app1.com/epoch',
      'https://app2.com/epoch',
      'https://app3.com/epoch'
    ]
  }
}))


import { NotifySimulationEpochUseCase } from '../../../src/application/user-cases/notify-simulation-epoch.use-case'
import { createSimulation } from '../../helpers/test-helpers'
import { fetch as undiciFetch, Agent as UndiciAgent } from 'undici'

describe('NotifySimulationEpochUseCase', () => {
  let useCase: NotifySimulationEpochUseCase
  let mockFetch: ReturnType<typeof vi.fn>
  let mockAgent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Get references to the mocked functions
    mockFetch = vi.mocked(undiciFetch)
    mockAgent = vi.mocked(UndiciAgent)
    
    useCase = new NotifySimulationEpochUseCase()
  })

  describe('execute', () => {
    it('should send epoch notifications to all URLs', async () => {
      // Arrange
      const simulation = createSimulation({ unixEpochStartTime: 1640995200000 })
      mockFetch.mockResolvedValue({ ok: true } as any)
      mockAgent.mockReturnValue({} as any)

      // Act
      await useCase.execute(simulation)

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      const simulation = createSimulation({ unixEpochStartTime: 1640995200000 })
      mockFetch
        .mockResolvedValueOnce({ ok: true } as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true } as any)
      mockAgent.mockReturnValue({} as any)

      // Act
      await useCase.execute(simulation)

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })
})