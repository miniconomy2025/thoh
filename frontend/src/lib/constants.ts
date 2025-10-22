export const CONSTANTS = {
  API_URL: "https://ec2-13-244-65-62.af-south-1.compute.amazonaws.com",
  SIMULATION_SYNC_INTERVAL: 2 * 60 * 1000, // 2 minutes in ms ,
  SIMULATION_SECOND_IN_MS: 12 * 60 * 1000,
  COMMERCIAL_BANK_URL: import.meta.env.VITE_COMMERCIAL_BANK_URL || 'http://localhost:3000',
}