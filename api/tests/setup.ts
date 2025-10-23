import { vi } from 'vitest'

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
