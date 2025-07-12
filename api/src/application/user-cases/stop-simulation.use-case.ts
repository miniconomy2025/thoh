import { ISimulationRepository } from '../ports/repository.ports';
import { NotifyEndSimulationUseCase } from './notify-end-simulation.use-case';

export class StopSimulationUseCase {
    constructor(
        private readonly simulationRepo: ISimulationRepository
    ) {}

    public async execute(simulationId: number): Promise<void> {
        const simulation = await this.simulationRepo.findById(simulationId);
        if (!simulation) {
            throw new Error('Simulation not found');
        }

        const endSimulationNotificationUseCase = new NotifyEndSimulationUseCase();
        await endSimulationNotificationUseCase.execute();
        
        simulation.end();
        await this.simulationRepo.save(simulation);
    }
} 