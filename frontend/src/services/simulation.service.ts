import { CONSTANTS } from "../lib/constants";
import type { Machine } from "../lib/types/machines.types";
import type { People } from "../lib/types/people.types";
import type { RawMaterial } from "../lib/types/rawMaterials.types";
import type { BaseApiError } from "../lib/types/shared.types";
import type { EntityInfoResponse, SimulationInfoResponse, StartSimulationResponse, StopSimulationResponse } from "../lib/types/simulation.types";
import type { SimulationTime, SimulationTimeResponse } from "../lib/types/time.types";
import type { Truck } from "../lib/types/truck.types";

export type SimulationService = {
  startSimulation: () => Promise<StartSimulationResponse | BaseApiError>,
  getSimulation: () => Promise<StartSimulationResponse | BaseApiError>,
  stopSimulation: () => Promise<StopSimulationResponse | BaseApiError>,
  getPeople: () => Promise<People | BaseApiError>,
  getEpochTime: () => Promise<Date | BaseApiError>,
  getCurrentSimulationTime: () => Promise<SimulationTime | BaseApiError>,
  getMachines: () => Promise<Machine[] | BaseApiError>,
  getTrucks: () => Promise<Truck[] | BaseApiError>,
  getRawMaterials: () => Promise<RawMaterial[] | BaseApiError>,
  simulationInfo: () => Promise<SimulationInfoResponse | BaseApiError>,
  entityInfo: () => Promise<EntityInfoResponse[] | BaseApiError>,
}

const simulationService: SimulationService = {
  startSimulation: async function (): Promise<StartSimulationResponse | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/simulations`, {
      method: 'POST'
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
      return data.people as People;
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getEpochTime: async function (): Promise<Date | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/time`);

    if (response.ok) {
      const data: { epochStartTime: number } = await response.json();
      return new Date(data.epochStartTime);
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
  getMachines: async function (): Promise<Machine[] | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/machines`);

    if (response.ok) {
      const data = await response.json();
      return data.machines as Machine[];
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getTrucks: async function (): Promise<Truck[] | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/trucks`);
    if (response.ok) {
      const data = await response.json();
      return data as Truck[];
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },
  getRawMaterials: async function (): Promise<RawMaterial[] | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/raw-materials`);

    if (response.ok) {
      const data = await response.json();
      return data as RawMaterial[];
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  },

  getSimulation: async function (): Promise<StartSimulationResponse | BaseApiError> {
    const response = await fetch(`${CONSTANTS.API_URL}/simulations`, {
    });

    if (response.ok) {
      const data = await response.json();
      return data as StartSimulationResponse;
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
  },
  entityInfo: async function (): Promise<EntityInfoResponse[] | BaseApiError> {
    const response = await fetch(`${CONSTANTS.COMMERCIAL_BANK_URL}/api/dashboard/accounts`);

    if (response.ok) {
      const data = await response.json();
      return data as EntityInfoResponse[];
    } else {
      const error = await response.json();
      return error as BaseApiError;
    }
  }
};

export default simulationService