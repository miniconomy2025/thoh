import { IPopulationRepository } from '../../../application/ports/repository.ports';
import { Population as PopulationEntity } from '../../../domain/population/population.entity';
import { AppDataSource } from '../../../domain/shared/data-source';

export class PgPopulationRepository implements IPopulationRepository {
  private repo = AppDataSource.getRepository(PopulationEntity);

  async find(): Promise<PopulationEntity | null> {
    const all = await this.repo.find({
      relations: ['people', 'people.phone', 'people.phone.model'],
      take: 1
    });
    return all[0] || null;
  }

  async save(population: PopulationEntity): Promise<void> {
    await this.repo.save(population);
  }

  async updatePerson(person: import('../../../domain/population/person.entity').Person): Promise<void> {
    await AppDataSource.getRepository(require('../../../domain/population/person.entity').Person).save(person);
  }
} 