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
  fromDbRawMaterials(data: { rawMaterials: Record<string, unknown>[] }) {
    const rawMaterials = Array.isArray(data.rawMaterials)
      ? data.rawMaterials.map((m: Record<string, unknown>) => {
          const costPerKg = Number(m.costPerKg);
          const availableWeight = Number(m.availableWeight);
          return new RawMaterial(
            Number(m.material_static_id),
            costPerKg,
            availableWeight
          );
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
  async fromDbMachines(data: { machines: Record<string, unknown>[] }) {
    const defaultCurrency = await this.getDefaultCurrency();
    const machines = Array.isArray(data.machines)
      ? data.machines.map((m: Record<string, unknown>) => {
          const costAmount = Number(m.cost);
          const weightValue = Number(m.weight);
          // Build materialRatio object from columns
          const materialRatio: Record<string, number> = {};
          const ratioFields = ['cases', 'screens', 'electronics', 'copper', 'silicon', 'plastic', 'aluminium', 'sand'];
          for (const field of ratioFields) {
            if (m[field] !== null && m[field] !== undefined) {
              materialRatio[field] = Number(m[field]);
            }
          }
          return new Machine(
            m.machine_static_id as number,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            materialRatio,
            m.productionRate ? Number(m.productionRate) : 100,
            m.quantity ? Number(m.quantity) : 1,
            m.machine_id as number,
            m.sold !== undefined ? !!m.sold : false
          );
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
  async fromDbTrucks(data: { trucks: Record<string, unknown>[] }) {
    const defaultCurrency = await this.getDefaultCurrency();
    const trucks = Array.isArray(data.trucks)
      ? data.trucks.map((t: Record<string, unknown>) => {
          const costAmount = Number(t.cost);
          const weightValue = Number(t.weight);
          const opCostAmount = Number(t.operatingCostPerDay);
          return new Truck(
            t.vehicle_static_id as number,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            { amount: opCostAmount, currency: defaultCurrency },
            t.quantity ? Number(t.quantity) : 1,
            t.id as number,
            t.sold !== undefined ? !!t.sold : false
          );
        })
      : [];
    return new TrucksMarket(trucks);
  }
}; 