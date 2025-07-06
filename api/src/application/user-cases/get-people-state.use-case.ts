import { IPopulationRepository } from '../ports/repository.ports';


//not implemented
export class GetPeopleStateUseCase {
  constructor(private readonly populationRepo: IPopulationRepository) {}
  async execute() {
    const population = await this.populationRepo.find();
    if (!population) throw new Error('Population not found');
    return {
      people: population.getPeople().map(person => ({
        id: person.id,
        salary: person.salary,
        phone: person.phone,
        phoneWorking: person.phoneWorking,
      })),
    };
  }
} 