import { v4 } from 'uuid';
export type SimulationStatus = 'NOT_STARTED' | 'running' | 'ENDED';


const SIMULATION_START_DATE = new Date('2050-01-01T00:00:00Z');
const DAYS_IN_YEAR = 360;

export class Simulation {
    id?: number=0;
    status: string = 'not_started';
    currentDay: number = 0;
    private startDate: Date = new Date(SIMULATION_START_DATE);
    private unixEpochStartTime: number = 0;

    constructor(id?: number, startDate: Date = SIMULATION_START_DATE, status: string = 'running', currentDay: number = 0, unixEpochStartTime: number = 0) {
        this.id = id;
        this.startDate = startDate;
        this.status = status;
        this.currentDay = currentDay;
        this.unixEpochStartTime = unixEpochStartTime;
    }

    start() {
        this.status = 'running';
        this.currentDay = 1;
        this.startDate = new Date(SIMULATION_START_DATE);
        this.unixEpochStartTime = Date.now();
    }

    advanceDay() {
        if (this.status !== 'running') throw new Error('Simulation not running');
        this.currentDay++;
    }

    end() {
        this.status = 'ENDED';
    }

    /**
     * Returns the current simulation date as a Date object.
     */
    getCurrentSimDate(): Date {
        const date = new Date(this.startDate);
        date.setUTCDate(this.startDate.getUTCDate() + this.currentDay - 1);
        return date;
    }

    /**
     * Returns the current simulation date as an ISO string (YYYY-MM-DD).
     */
    getCurrentSimDateString(): string {
        return this.getCurrentSimDate().toISOString().split('T')[0];
    }

    getUnixEpochStartTime(): number {
        return this.unixEpochStartTime;
    }
}