import { AdvanceSimulationDayUseCase } from '../../application/user-cases/advance-simulation-day.use-case';

export const PICKUP_TIME = '00:00';
export const DELIVERY_TIME = '23:59:59';
export const SIM_DAY_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

// This would be called by a scheduler (e.g., node-cron or setInterval)
export function runDailyTasks(advanceDayUseCase: AdvanceSimulationDayUseCase) {
  // advanceDayUseCase.execute(simulationId, marketId);
  // console.log(`[SIM] Daily tasks executed for simulationId=${simulationId}, marketId=${marketId}. Pickups at ${PICKUP_TIME}, deliveries at ${DELIVERY_TIME}.`);
}
