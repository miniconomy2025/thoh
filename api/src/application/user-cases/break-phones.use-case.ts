import { IPopulationRepository } from "../ports/repository.ports";
import { RecycleRepository } from '../../infrastructure/persistence/postgres/recycle.repository';
import { Phone } from '../../domain/population/phone.entity';
import { Recycle } from '../../domain/population/recycle.entity';
import { PersonRepository } from '../../infrastructure/persistence/postgres/person.repository';

export class BreakPhonesUseCase {
    constructor(private readonly populationRepo: IPopulationRepository) {}

    public async execute(): Promise<void> {
        const recycleRepo = new RecycleRepository();
        const people = await PersonRepository.getRepo().find({ relations: ['phone', 'phone.model'] });
        const peopleWithPhones = people.filter(p => p.phone);
        // Shuffle the array
        for (let i = peopleWithPhones.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [peopleWithPhones[i], peopleWithPhones[j]] = [peopleWithPhones[j], peopleWithPhones[i]];
        }
        const toBreak = peopleWithPhones.slice(0, 10);
        for (const person of toBreak) {
            if (person.phone) {
                person.phone.isBroken = true;
                const recycle = new Recycle();
                recycle.phone = person.phone as Phone;
                await recycleRepo.save(recycle);
                person.phone = null;
                await this.populationRepo.updatePerson(person);
            }
        }
    }
} 