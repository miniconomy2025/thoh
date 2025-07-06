import { IMarketRepository } from '../ports/repository.ports';

export class GetRawMaterialsUseCase {
    constructor(private readonly marketRepo: IMarketRepository) {}

    async execute() {
        const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
        if (!rawMaterialsMarket) {
            throw new Error('Raw materials market not found');
        }

        const rawMaterials = rawMaterialsMarket.getRawMaterials();
        
        if (rawMaterials.length === 0) {
            return [];
        }

        const materialGroups = new Map<string, any[]>();
        
        rawMaterials.forEach(material => {
            const materialName = material.rawMaterialName;
            if (!materialGroups.has(materialName)) {
                materialGroups.set(materialName, []);
            }
            materialGroups.get(materialName)!.push(material);
        });

        const rawMaterialsResponse = Array.from(materialGroups.entries()).map(([materialName, materialList]) => {
            const totalQuantity = materialList.reduce((sum, material) => sum + material.quantityAvailable, 0);
            
            console.log(`[DEBUG] Material ${materialName} prices:`, materialList.map(m => ({ 
                name: m.name, 
                costPerKg: m.costPerKg, 
                pricePerKg: m.pricePerKg,
                quantity: m.quantityAvailable 
            })));
            
            const totalPricePerKg = materialList.reduce((sum, material) => {
                const price = Number(material.pricePerKg);
                return sum + (price || 0);
            }, 0);
            const averagePricePerKg = Math.round((totalPricePerKg / materialList.length) * 100) / 100; // Round to 2 decimal places


            return {
                rawMaterialName: materialName,
                pricePerKg: averagePricePerKg,
                quantityAvailable: Math.floor(totalQuantity)
            };
        });

        return rawMaterialsResponse;
    }
} 