import { RawMaterial } from '../../../domain/market/raw-material.entity';
import { Machine, Truck } from '../../../domain/market/equipment.entity';
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../../domain/market/market.aggregate';
import { PgCurrencyRepository } from './currency.repository';

export const MarketMapper = {
  currencyRepo: new PgCurrencyRepository(),

  async getDefaultCurrency(): Promise<string> {
    const currency = await this.currencyRepo.getDefaultCurrency();
    return currency?.code || 'D'; // fallback to 'D' if not found
  },

  toDbRawMaterials(market: RawMaterialsMarket) {
    return {
      rawMaterials: Array.isArray(market.getRawMaterials()) ? market.getRawMaterials().map(m => ({
        material_static_id: m.material_static_id,
        costPerKg: m.costPerKg,
        availableWeight: m.availableWeight
      })) : []
    };
  },
  fromDbRawMaterials(data: any) {
    const rawMaterials = Array.isArray(data.rawMaterials)
      ? data.rawMaterials.map((m: any) => {
          const costPerKg = typeof m.costPerKg === 'object' ? m.costPerKg.amount : Number(m.costPerKg);
          const availableWeight = typeof m.availableWeight === 'object' ? m.availableWeight.value : Number(m.availableWeight);
          return new RawMaterial(m.material_static_id, costPerKg, availableWeight);
        })
      : [];
    return new RawMaterialsMarket(rawMaterials);
  },
  toDbMachines(market: MachinesMarket) {
    return {
      machines: Array.isArray(market.getMachinesForSale()) ? market.getMachinesForSale().map(m => ({
        id: m.id,
        machine_static_id: m.machineStaticId,
        cost: { ...m.cost },
        weight: { ...m.weight },
        materialRatio: m.materialRatio,
        productionRate: m.productionRate,
        quantity: m.quantity
      })) : []
    };
  },
  async fromDbMachines(data: any) {
    const defaultCurrency = await this.getDefaultCurrency();
    const machines = Array.isArray(data.machines)
      ? data.machines.map((m: any) => {
          const costAmount = Number(m.cost);
          const weightValue = Number(m.weight);
          if (!Number.isFinite(costAmount) || isNaN(costAmount)) {
            console.error('[ERROR] Invalid machine cost loaded from DB:', m);
            throw new Error('Invalid machine cost loaded from DB');
          }
          if (!Number.isFinite(weightValue) || isNaN(weightValue)) {
            console.error('[ERROR] Invalid machine weight loaded from DB:', m);
            throw new Error('Invalid machine weight loaded from DB');
          }
          // Build materialRatio object from columns
          const materialRatio: Record<string, number> = {};
          const ratioFields = ['cases', 'screens', 'electronics', 'copper', 'silicon', 'plastic', 'aluminium', 'sand'];
          for (const field of ratioFields) {
            if (m[field] !== null && m[field] !== undefined) {
              materialRatio[field] = Number(m[field]);
            }
          }
          // Construct Machine instance
          const machine = new Machine(
            m.machine_static_id,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            materialRatio,
            m.productionRate || 100,
            m.quantity || 1,
            m.machine_id,
            m.sold !== undefined ? !!m.sold : false
          );
          return machine;
        })
      : [];
    return new MachinesMarket(machines);
  },
  toDbTrucks(market: TrucksMarket) {
    return {
      trucks: Array.isArray(market.getTrucksForSale()) ? market.getTrucksForSale().map(t => ({
        id: t.id,
        vehicle_static_id: t.vehicleStaticId,
        cost: { ...t.cost },
        weight: { ...t.weight },
        operatingCostPerDay: { ...t.operatingCostPerDay },
        quantity: t.quantity
      })) : []
    };
  },
  async fromDbTrucks(data: any) {
    const defaultCurrency = await this.getDefaultCurrency();
    const trucks = Array.isArray(data.trucks)
      ? data.trucks.map((t: any) => {
          const costAmount = Number(t.cost);
          const weightValue = Number(t.weight);
          const opCostAmount = Number(t.operatingCostPerDay);
          if (!Number.isFinite(costAmount) || isNaN(costAmount)) {
            console.error('[ERROR] Invalid truck cost loaded from DB:', t);
            throw new Error('Invalid truck cost loaded from DB');
          }
          if (!Number.isFinite(weightValue) || isNaN(weightValue)) {
            console.error('[ERROR] Invalid truck weight loaded from DB:', t);
            throw new Error('Invalid truck weight loaded from DB');
          }
          if (!Number.isFinite(opCostAmount) || isNaN(opCostAmount)) {
            console.error('[ERROR] Invalid truck operating cost loaded from DB:', t);
            throw new Error('Invalid truck operating cost loaded from DB');
          }
          const truck = new Truck(
            t.vehicle_static_id,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            { amount: opCostAmount, currency: defaultCurrency },
            t.quantity || 1,
            t.id
          );
          truck.sold = t.sold !== undefined ? !!t.sold : false;
          return truck;
        })
      : [];
    return new TrucksMarket(trucks);
  }
}; 