import { IMarketRepository } from '../ports/repository.ports';
import { MaterialStatic } from '../../domain/market/material-static.entity';
import { MaterialStaticRepository } from '../../infrastructure/persistence/postgres/material-static.repository';

export class GetRawMaterialsUseCase {
    constructor(private readonly marketRepo: IMarketRepository, private readonly materialStaticRepo = new MaterialStaticRepository()) {}

    async execute() {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        if (!rawMaterialsMarket) {
            throw new Error('Raw materials market not found');
        }

        const rawMaterials = rawMaterialsMarket.getRawMaterials();
        
        if (rawMaterials.length === 0) {
            return [];
        }

        // Fetch all static material data from the DB
        const staticMaterials = await this.materialStaticRepo.findAll();
        const staticLookup = new Map(staticMaterials.map((sm: any) => [sm.id, sm]));

        const materialGroups = new Map<string, any[]>();
        
        rawMaterials.forEach(material => {
            if (material.material_static_id === undefined) return;
            const staticData = staticLookup.get(material.material_static_id);
            const materialName = staticData?.name || `material_${material.material_static_id}`;
            if (!materialGroups.has(materialName)) {
                materialGroups.set(materialName, []);
            }
            materialGroups.get(materialName)!.push({
                costPerKg: material.costPerKg,
                pricePerKg: material.pricePerKg,
                quantityAvailable: material.quantityAvailable,
                staticData
            });
        });

        const rawMaterialsResponse = Array.from(materialGroups.entries()).map(([materialName, materialList]) => {
            const totalQuantity = materialList.reduce((sum, material) => sum + material.quantityAvailable, 0);
            
            const totalPricePerKg = materialList.reduce((sum, material) => {
                const price = Number(material.pricePerKg);
                return sum + (price || 0);
            }, 0);
            const averagePricePerKg = Math.round((totalPricePerKg / materialList.length) * 100) / 100; // Round to 2 decimal places


            return {
                rawMaterialName: materialName,
                description: materialList[0].staticData?.description,
                pricePerKg: averagePricePerKg,
                quantityAvailable: Math.floor(totalQuantity)
            };
        });

        return rawMaterialsResponse;
    }
} 