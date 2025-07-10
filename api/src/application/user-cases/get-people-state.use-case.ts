import { IPopulationRepository } from '../ports/repository.ports';
import { PersonRepository } from '../../infrastructure/persistence/postgres/person.repository';


//not implemented
export class GetPeopleStateUseCase {
  constructor(private readonly populationRepo: IPopulationRepository) {}
  async execute() {
    const people = await PersonRepository.getRepo().find({ relations: ['phone', 'phone.model'] });
    return {
      people: people.map((person: import('../../domain/population/person.entity').Person) => ({
        id: person.id,
        salary: person.salary,
        phone: person.phone
          ? {
              id: person.phone.id,
              isBroken: person.phone.isBroken,
              model: person.phone.model
                ? {
                    id: person.phone.model.id,
                    name: person.phone.model.name
                  }
                : null
            }
          : null,
        phoneWorking: person.phone ? !person.phone.isBroken : false,
      })),
    };
  }
} 