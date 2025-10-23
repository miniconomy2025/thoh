import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock modules before any imports
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => Buffer.from('mock-cert'))
  },
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

vi.mock('../../../src/infrastructure/config/end-simulation-notification.config', () => ({
  endSimulationNotificationConfig: {
    endSimulationNotificationUrls: [
      'https://app1.com/end',
      'https://app2.com/end',
      'https://app3.com/end'
    ]
  }
}))

import { NotifyEndSimulationUseCase } from '../../../src/application/user-cases/notify-end-simulation.use-case'
import { fetch as undiciFetch, Agent as UndiciAgent } from 'undici'

describe('NotifyEndSimulationUseCase', () => {
  let useCase: NotifyEndSimulationUseCase
  let mockFetch: ReturnType<typeof vi.fn>
  let mockAgent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Get references to the mocked functions
    mockFetch = vi.mocked(undiciFetch)
    mockAgent = vi.mocked(UndiciAgent)
    
    useCase = new NotifyEndSimulationUseCase()
  })

  describe('execute', () => {
    it('should send notifications to all URLs', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: true } as any)
      mockAgent.mockReturnValue({} as any)

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockAgent).toHaveBeenCalledTimes(1)
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({ ok: true } as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true } as any)
      mockAgent.mockReturnValue({} as any)

      // Act
      await useCase.execute()

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockAgent).toHaveBeenCalledTimes(1)
    })
  })
})