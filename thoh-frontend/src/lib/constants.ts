export const CONSTANTS = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  COMMERCIAL_BANK_URL: import.meta.env.VITE_COMMERCIAL_BANK_URL || "http://localhost:3001",
  SIMULATION_SYNC_INTERVAL: 2 * 60 * 1000, // 2 minutes in ms ,
  SIMULATION_SECOND_IN_MS: 12 * 60 * 1000,
}