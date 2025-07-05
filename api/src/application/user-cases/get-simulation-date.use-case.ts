import { ISimulationRepository } from '../ports/repository.ports';

//not implemented
export class GetSimulationDateUseCase {
  constructor(private readonly simulationRepo: ISimulationRepository) {}
  async execute(simulationId: number) {
    const simulation = await this.simulationRepo.findById(simulationId);
    if (!simulation) throw new Error('Simulation not found');
    return { date: simulation.getCurrentSimDateString() };
  }
} 