import { v4 } from 'uuid';
export type SimulationStatus = 'not_started' | 'running' | 'completed' | 'paused';


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
        this.status = 'completed';
    }

    /**
     * Returns the current simulation date as a Date object.
     */
    getCurrentSimDate(): Date {
        const date = new Date(this.startDate);
        date.setUTCDate(this.startDate.getUTCDate() + this.currentDay - 1);
        return date;
    }

    getCurrentSimTime(): string {
        // 2 real minutes (120000ms) = 1 simulation day (24 hours or 86400 simulation seconds)
        // So each real millisecond = 86400/120000 = 0.72 simulation seconds
        const SIM_DAY_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
        const elapsedRealMs = Date.now() - this.unixEpochStartTime;
        
        // Get milliseconds elapsed in current day
        const msInCurrentDay = elapsedRealMs % SIM_DAY_MS;
        
        // Convert to simulation time (24 hours distributed across 2 real minutes)
        const totalSimSeconds = Math.floor((msInCurrentDay / SIM_DAY_MS) * 24 * 60 * 60);
        
        const hours = Math.floor(totalSimSeconds / 3600);
        const minutes = Math.floor((totalSimSeconds % 3600) / 60);
        const seconds = totalSimSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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