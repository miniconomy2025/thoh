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

  fromDb(data: any) {
    const simulation = new Simulation(
      data.id, 
      data.startdate || data.startDate, 
      data.status, 
      data.currentDay,
      data.unixepochstarttime || data.unixEpochStartTime || 0
    );
    return simulation;
  }
}; 