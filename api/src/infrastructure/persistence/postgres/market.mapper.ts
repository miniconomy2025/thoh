import { RawMaterial } from '../../../domain/market/raw-material.entity';
import { Machine, Truck } from '../../../domain/market/equipment.entity';
import { MachineType, TruckType } from '../../../domain/market/market.types';
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
        name: m.name,
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
          return new RawMaterial(m.name, costPerKg, availableWeight);
        })
      : [];
    return new RawMaterialsMarket(rawMaterials);
  },
  toDbMachines(market: MachinesMarket) {
    return {
      machines: Array.isArray(market.getMachinesForSale()) ? market.getMachinesForSale().map(m => ({
        id: m.id,
        type: m.type,
        cost: { ...m.cost },
        weight: { ...m.weight },
        materialRatio: m.materialRatio,
        materialRatioDescription: m.materialRatioDescription,
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
          const machine = new Machine(
            m.type as MachineType,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            m.materialRatio || "1:2:5",
            m.productionRate || 100,
            m.quantity || 1,
            m.id,
            m.sold !== undefined ? !!m.sold : false,
            m.materialRatioDescription
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
        type: t.type,
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
          const opCostAmount = Number(t.operatingCostPerDay);
          if (!Number.isFinite(costAmount) || isNaN(costAmount)) {
            console.error('[ERROR] Invalid truck cost loaded from DB:', t);
            throw new Error('Invalid truck cost loaded from DB');
          }
          if (!Number.isFinite(opCostAmount) || isNaN(opCostAmount)) {
            console.error('[ERROR] Invalid truck operating cost loaded from DB:', t);
            throw new Error('Invalid truck operating cost loaded from DB');
          }
          const truck = new Truck(
            t.type as TruckType,
            { amount: costAmount, currency: defaultCurrency },
            { value: Number(t.weight), unit: 'kg' },
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