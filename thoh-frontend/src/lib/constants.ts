export const CONSTANTS = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  SIMULATION_SYNC_INTERVAL: 2 * 60 * 1000, // 2 minutes in ms ,
  SIMULATION_SECOND_IN_MS: 12 * 60 * 1000,
}