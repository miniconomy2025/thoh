import { PhoneStatic } from '../../../domain/population/phone-static.entity';
import { AppDataSource } from '../../../domain/shared/data-source';

export class PhoneStaticRepository {
    private repo = AppDataSource.getRepository(PhoneStatic);

    async findAll(): Promise<PhoneStatic[]> {
        return this.repo.find();
    }

    public getRepo() {
        return this.repo;
    }

    public static getRepo() {
        return AppDataSource.getRepository(PhoneStatic);
    }
} 