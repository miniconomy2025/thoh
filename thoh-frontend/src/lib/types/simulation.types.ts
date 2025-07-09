import type { BaseApiResponse } from "./shared.types";

export type StartSimulationResponse = BaseApiResponse & { simulationId: number };

export type StopSimulationResponse = BaseApiResponse;