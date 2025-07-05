import { RawMaterial } from '../../../domain/market/raw-material.entity';
import { Machine, Vehicle } from '../../../domain/market/equipment.entity';
import { MachineType, VehicleType } from '../../../domain/market/market.types';
import { RawMaterialsMarket, MachinesMarket, VehiclesMarket } from '../../../domain/market/market.aggregate';
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
      ? data.rawMaterials.map((m: any) => new RawMaterial(
          m.name,
          typeof m.costPerKg === 'object' ? m.costPerKg.amount : m.costPerKg,
          typeof m.availableWeight === 'object' ? m.availableWeight.value : m.availableWeight,
          m.marketId
        ))
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
        productionRatio: m.productionRatio
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
          return new Machine(
            m.type as MachineType,
            { amount: costAmount, currency: defaultCurrency },
            { value: weightValue, unit: 'kg' },
            m.productionRatio,
            m.marketId,
            m.id,
          );
        })
      : [];
    return new MachinesMarket(machines);
  },
  toDbVehicles(market: VehiclesMarket) {
    return {
      vehicles: Array.isArray(market.getVehiclesForSale()) ? market.getVehiclesForSale().map(v => ({
        id: v.id,
        type: v.type,
        cost: { ...v.cost },
        weight: { ...v.weight },
        operatingCostPerDay: { ...v.operatingCostPerDay }
      })) : []
    };
  },
  async fromDbVehicles(data: any) {
    const defaultCurrency = await this.getDefaultCurrency();
    const vehicles = Array.isArray(data.vehicles)
      ? data.vehicles.map((v: any) => {
          const costAmount = Number(v.cost);
          const opCostAmount = Number(v.operatingCostPerDay);
          if (!Number.isFinite(costAmount) || isNaN(costAmount)) {
            console.error('[ERROR] Invalid vehicle cost loaded from DB:', v);
            throw new Error('Invalid vehicle cost loaded from DB');
          }
          if (!Number.isFinite(opCostAmount) || isNaN(opCostAmount)) {
            console.error('[ERROR] Invalid vehicle operating cost loaded from DB:', v);
            throw new Error('Invalid vehicle operating cost loaded from DB');
          }
          return new Vehicle(
            v.type as VehicleType,
            { amount: costAmount, currency: defaultCurrency },
            { value: v.weight, unit: v.weight.unit },
            { amount: opCostAmount, currency: defaultCurrency },
            v.marketId,
            v.id
          );
        })
      : [];
    return new VehiclesMarket(vehicles);
  }
}; 