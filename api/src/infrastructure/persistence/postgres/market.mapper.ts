import { RawMaterial } from '../../../domain/market/raw-material.entity';
import { Machine as MachineEntity } from '../../../domain/market/machine.entity';
import { Truck as TruckEntity } from '../../../domain/market/vehicle.entity';
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../../domain/market/market.aggregate';
import { PgCurrencyRepository } from './currency.repository';
import { Machine } from '../../../domain/market/equipment.entity';
import { Truck } from '../../../domain/market/equipment.entity';

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
  fromDbRawMaterials(data: { rawMaterials: RawMaterial[] }) {
    return new RawMaterialsMarket(data.rawMaterials);
  },
  toDbMachines(market: MachinesMarket) {
    return {
      machines: Array.isArray(market.getMachinesForSale()) ? market.getMachinesForSale().map(m => ({
        machine_static_id: m.machineStaticId,
        cost: m.cost.amount,
        weight: m.weight.value,
        productionRate: m.productionRate,
        quantity: m.quantity
      })) : []
    };
  },
  async fromDbMachines(data: { machines: MachineEntity[] }) {
    // Map TypeORM entities to domain models if needed
    // If MachinesMarket expects domain models, convert here
    return new MachinesMarket(data.machines.map(m =>
      new Machine(
        m.machine_static_id!,
        { amount: Number(m.cost), currency: 'ZAR' },
        { value: Number(m.weight), unit: 'kg' },
        m.productionRate,
        m.quantity,
        m.id
      )
    ));
  },
  toDbTrucks(market: TrucksMarket) {
    return {
      trucks: Array.isArray(market.getTrucksForSale()) ? market.getTrucksForSale().map(t => ({
        vehicle_static_id: t.vehicleStaticId,
        cost: t.cost.amount,
        weight: t.weight.value,
        operatingCostPerDay: t.operatingCostPerDay.amount,
        quantity: t.quantity,
        sold: t.sold
      })) : []
    };
  },
  async fromDbTrucks(data: { trucks: TruckEntity[] }) {
    return new TrucksMarket(data.trucks.map(t =>
      new Truck(
        t.vehicle_static_id!,
        { amount: Number(t.cost), currency: 'ZAR' },
        { value: Number(t.weight), unit: 'kg' },
        { amount: Number(t.operatingCostPerDay), currency: 'ZAR' },
        t.quantity,
        t.id,
        t.sold
      )
    ));
  }
}; 