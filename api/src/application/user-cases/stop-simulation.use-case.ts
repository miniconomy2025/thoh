import { ISimulationRepository } from '../ports/repository.ports';

export class StopSimulationUseCase {
    constructor(
        private readonly simulationRepo: ISimulationRepository
    ) {}

    public async execute(simulationId: number): Promise<void> {
        const simulation = await this.simulationRepo.findById(simulationId);
        if (!simulation) {
            throw new Error('Simulation not found');
        }
        
        simulation.end();
        await this.simulationRepo.save(simulation);
    }
} 