import type { BaseApiResponse, Chart } from "./shared.types";
export type StartSimulationResponse = BaseApiResponse & { simulationId: number };

export type StopSimulationResponse = BaseApiResponse;

export type SimulationInfoResponse = BaseApiResponse & {
    daysElapsed: number,
    totalTrades: number,
    activities: {
        id: string;
        time: string;
        description: string;
        amount: number;
    }[],
    machinery: Chart[],
    trucks: Chart[],
    rawMaterials: Chart[]
};