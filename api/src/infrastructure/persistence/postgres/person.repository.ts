import { Person } from '../../../domain/population/person.entity';
import { Phone } from '../../../domain/population/phone.entity';
import { AppDataSource } from '../../../domain/population/data-source';

export class PersonRepository {
    private repo = AppDataSource.getRepository(Person);
    private phoneRepo = AppDataSource.getRepository(Phone);

    async save(person: Person): Promise<Person> {
        console.log('Saving person:', person.id, 'phone:', person.phone);
        // Defensive: ensure phone is loaded if not present
        if (!person.phone && person.id) {
            const existing = await this.repo.findOne({ where: { id: person.id }, relations: ['phone'] });
            if (existing && existing.phone) {
                person.phone = existing.phone;
            }
        }
        if (person.phone) {
            await this.phoneRepo.save(person.phone);
        }
        return this.repo.save(person);
    }

    async saveMany(persons: Person[]): Promise<Person[]> {
        for (const person of persons) {
            console.log('Saving person (batch):', person.id, 'phone:', person.phone);
            if (person.phone) {
                await this.phoneRepo.save(person.phone);
            }
        }
        return this.repo.save(persons);
    }

    async findAll(): Promise<Person[]> {
        return this.repo.find({ relations: ['phone', 'phone.model'] });
    }

    public getRepo() {
        return this.repo;
    }

    public static getRepo() {
        return AppDataSource.getRepository(Person);
    }
} 