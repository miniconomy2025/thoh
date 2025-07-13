import { ISimulationRepository } from '../ports/repository.ports';
import { NotifyEndSimulationUseCase } from './notify-end-simulation.use-case';
import { QueueInitializer } from '../../infrastructure/queue/queue.initializer';

export class StopSimulationUseCase {
    constructor(
        private readonly simulationRepo: ISimulationRepository,
        private readonly queueInitializer: QueueInitializer
    ) {}

    public async execute(simulationId: number): Promise<void> {
        const simulation = await this.simulationRepo.findById(simulationId);
        if (!simulation) {
            throw new Error('Simulation not found');
        }

        // First, stop the queue consumers and wait for in-flight messages
        await this.queueInitializer.shutdown();

        const endSimulationNotificationUseCase = new NotifyEndSimulationUseCase();
        await endSimulationNotificationUseCase.execute();
        
        simulation.end();
        await this.simulationRepo.save(simulation);
    }
} 