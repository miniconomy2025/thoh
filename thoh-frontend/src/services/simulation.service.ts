import { CONSTANTS } from "../lib/constants";
import type { People } from "../lib/types/people.types";
import type { BaseApiError } from "../lib/types/shared.types";
import type { SimulationInfoResponse, StartSimulationResponse, StopSimulationResponse } from "../lib/types/simulation.types";
import type { EpochTimeResponse, SimulationTime, SimulationTimeResponse } from "../lib/types/time.types";

export type SimulationService = {
  startSimulation: () => Promise<StartSimulationResponse | BaseApiError>,
  stopSimulation: () => Promise<StopSimulationResponse | BaseApiError>,
  getPeople: () => Promise<People | BaseApiError>,
  getEpochTime: () => Promise<Date | BaseApiError>,
  getCurrentSimulationTime: () => Promise<SimulationTime | BaseApiError>,
  simulationInfo: () => Promise<SimulationInfoResponse | BaseApiError>
}

const simulationService: SimulationService = {
  startSimulation: async function (): Promise<StartSimulationResponse | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/simulations`, {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      return data as StartSimulationResponse;
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getPeople: async function (): Promise<People | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/people`);

    if (response.ok) {
      const data = await response.json();
      return data as People;
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getEpochTime: async function (): Promise<Date | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/time`);

    if (response.ok) {
      const data: EpochTimeResponse = await response.json();
      return new Date(data.unixEpochStartTime);
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getCurrentSimulationTime: async function (): Promise<SimulationTime | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/current-simulation-time`);

    if (response.ok) {
      const data: SimulationTimeResponse = await response.json();
      return {
        simulationDateTime: new Date(`${data.simulationDate}T${data.simulationTime}`),
        simulationDay: data.simulationDay
      };
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  stopSimulation: async function (): Promise<StopSimulationResponse | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/stop`, {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      return data as StopSimulationResponse;
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  simulationInfo: async function (): Promise<SimulationInfoResponse | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/simulation-info`);

    if (response.ok) {
      const data = await response.json();
      return data as SimulationInfoResponse;
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  }
};

export default simulationService