import { RecycleRepository } from '../../infrastructure/persistence/postgres/recycle.repository';
import { PhoneStatic } from '../../domain/population/phone-static.entity';
import { AppDataSource } from '../../domain/shared/data-source';

export class RecyclePhonesUseCase {
    private recycleRepo = new RecycleRepository();

    async listGroupedByModel() {
        const recycled = await this.recycleRepo.findAll();
        // Group by model name
        const grouped: Record<string, { modelId: number, modelName: string, quantity: number }> = {};
        for (const r of recycled) {
            if (r.phone && r.phone.model) {
                const name = r.phone.model.name;
                if (!grouped[name]) {
                    grouped[name] = { modelId: r.phone.model.id, modelName: name, quantity: 0 };
                }
                grouped[name].quantity++;
            }
        }
        return Object.values(grouped);
    }

    async collectByModelName(modelName: string, quantity: number): Promise<{ collected: number, remaining: number }> {
        // Find all recycled phones with the given model name
        const recycled = await this.recycleRepo.findAll();
        const toCollect = recycled.filter(r => r.phone && r.phone.model && r.phone.model.name === modelName);
        const collectCount = Math.min(quantity, toCollect.length);
        if (collectCount === 0) {
            return { collected: 0, remaining: 0 };
        }
        // Remove the collected phones from recycle
        const manager = AppDataSource.manager;
        for (let i = 0; i < collectCount; i++) {
            await manager.remove(toCollect[i]);
        }
        return { collected: collectCount, remaining: toCollect.length - collectCount };
    }
} 