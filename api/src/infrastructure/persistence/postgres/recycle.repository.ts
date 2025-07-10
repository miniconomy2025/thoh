import { AppDataSource } from '../../../domain/population/data-source';
import { Recycle } from '../../../domain/population/recycle.entity';

export class RecycleRepository {
    private repo = AppDataSource.getRepository(Recycle);

    async save(recycle: Recycle): Promise<Recycle> {
        return this.repo.save(recycle);
    }

    async findAll(): Promise<Recycle[]> {
        return this.repo.find();
    }
} 