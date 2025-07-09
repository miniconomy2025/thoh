import { Simulation } from '../../../domain/simulation/simulation.aggregate';

export const SimulationMapper = {
  toDb(simulation: Simulation) {
    return {
      // id: simulation.id,
      status: simulation.status,
      currentDay: simulation.currentDay,
      unixEpochStartTime: simulation.getUnixEpochStartTime()
    };
  },

  fromDb(data: Record<string, unknown>) {
    const unixEpochStartTime =
      typeof data.unixepochstarttime === 'number' ? data.unixepochstarttime :
      typeof data.unixEpochStartTime === 'number' ? data.unixEpochStartTime : 0;
    const simulation = new Simulation(
      Number(data.id),
      (typeof data.startdate === 'string' || typeof data.startdate === 'number')
        ? new Date(data.startdate)
        : (typeof data.startDate === 'string' || typeof data.startDate === 'number')
          ? new Date(data.startDate)
          : undefined,
      typeof data.status === 'string' ? data.status : undefined,
      typeof data.currentDay === 'number' ? data.currentDay : 0,
      unixEpochStartTime
    );
    return simulation;
  }
}; 