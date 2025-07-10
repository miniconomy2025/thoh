import { Phone } from '../../../domain/population/phone.entity';
import { AppDataSource } from '../../../domain/population/data-source';

export class PhoneRepository {
    private repo = AppDataSource.getRepository(Phone);

    async save(phone: Phone): Promise<Phone> {
        return this.repo.save(phone);
    }

    public static getRepo() {
        return AppDataSource.getRepository(Phone);
    }
} 