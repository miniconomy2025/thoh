import { IMarketRepository } from '../../../application/ports/repository.ports';
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../../domain/market/market.aggregate';
import { Order } from '../../../domain/market/order.entity';
import { Collection } from '../../../domain/market/collection.entity';
import { AppDataSource } from '../../../domain/market/data-source';
import { Machine as MachineEntity } from '../../../domain/market/machine.entity';
import { Truck as TruckEntity } from '../../../domain/market/vehicle.entity';
import { RawMaterial as RawMaterialEntity } from '../../../domain/market/raw-material.entity';
import { MaterialStatic } from '../../../domain/market/material-static.entity';
// import { pool } from './client';
import { MarketMapper } from './market.mapper';

export class PgMarketRepository implements IMarketRepository {
  private machineRepo = AppDataSource.getRepository(MachineEntity);
  private truckRepo = AppDataSource.getRepository(TruckEntity);
  private rawMaterialRepo = AppDataSource.getRepository(RawMaterialEntity);
  private collectionRepo = AppDataSource.getRepository(Collection);
  private orderRepo = AppDataSource.getRepository(Order);
  private materialStaticRepo = AppDataSource.getRepository(MaterialStatic);

  async findRawMaterialsMarket(): Promise<RawMaterialsMarket | null> {
    const materials = await this.rawMaterialRepo.find();
    if (!materials.length) return null;
    return MarketMapper.fromDbRawMaterials({ rawMaterials: materials });
  }

  async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
    const staticIds = await this.rawMaterialRepo
      .createQueryBuilder('raw_material')
      .select('DISTINCT raw_material.material_static_id', 'material_static_id')
      .getRawMany();
    const allTypes = market.getRawMaterials().map(m => m.material_static_id);
    const seen = new Set<number>();
    // Handle types that already exist
    for (const { material_static_id } of staticIds) {
      if (typeof material_static_id !== 'number') continue;
      seen.add(material_static_id);
      const latest = await this.rawMaterialRepo.findOne({
        where: { material_static_id },
        order: { id: 'DESC' },
      });
      if (!latest || typeof latest.material_static_id !== 'number') continue;
      const m = market.getRawMaterials().find(m => m.material_static_id === material_static_id);
      if (!m) continue;
      const entity = new RawMaterialEntity(
        latest.material_static_id,
        m.costPerKg,
        m.availableWeight
      );
      await this.rawMaterialRepo.save(entity);
    }
    // Handle initial seed for types not yet in the table
    for (const material_static_id of allTypes) {
      if (typeof material_static_id !== 'number') continue;
      if (seen.has(material_static_id)) continue;
      const m = market.getRawMaterials().find(m => m.material_static_id === material_static_id);
      if (!m) continue;
      const entity = new RawMaterialEntity(
        material_static_id,
        m.costPerKg,
        m.availableWeight
      );
      await this.rawMaterialRepo.save(entity);
    }
  }

  async findMachinesMarket(): Promise<MachinesMarket | null> {
    const result = await this.machineRepo.find();
    if (result.length === 0) return null;
    return await MarketMapper.fromDbMachines({ machines: result });
  }

  async saveMachinesMarket(market: MachinesMarket): Promise<void> {
    const staticIds = await this.machineRepo
      .createQueryBuilder('machine')
      .select('DISTINCT machine.machine_static_id', 'machine_static_id')
      .getRawMany();
    const allTypes = market.getMachinesForSale().map(m => m.machineStaticId);
    const seen = new Set<number>();
    for (const { machine_static_id } of staticIds) {
      if (typeof machine_static_id !== 'number') continue;
      seen.add(machine_static_id);
      const latest = await this.machineRepo.findOne({
        where: { machine_static_id },
        order: { id: 'DESC' },
      });
      if (!latest) continue;
      const m = market.getMachinesForSale().find(m => m.machineStaticId === machine_static_id);
      if (!m) continue;
      const entity = new MachineEntity();
      entity.machine_static_id = latest.machine_static_id;
      entity.cost = m.cost.amount;
      entity.weight = m.weight.value;
      entity.materialRatio = typeof m.materialRatio === 'string' ? m.materialRatio : JSON.stringify(m.materialRatio);
      entity.productionRate = m.productionRate;
      entity.quantity = m.quantity;
      entity.sold = false;
      await this.machineRepo.save(entity);
    }
    // Initial seed for types not yet in the table
    for (const machine_static_id of allTypes) {
      if (seen.has(machine_static_id)) continue;
      const m = market.getMachinesForSale().find(m => m.machineStaticId === machine_static_id);
      if (!m) continue;
      const entity = new MachineEntity();
      entity.machine_static_id = machine_static_id;
      entity.cost = m.cost.amount;
      entity.weight = m.weight.value;
      entity.materialRatio = typeof m.materialRatio === 'string' ? m.materialRatio : JSON.stringify(m.materialRatio);
      entity.productionRate = m.productionRate;
      entity.quantity = m.quantity;
      entity.sold = false;
      await this.machineRepo.save(entity);
    }
  }

  async findTrucksMarket(): Promise<TrucksMarket | null> {
    const result = await this.truckRepo.find();
    if (result.length === 0) return null;
    return await MarketMapper.fromDbTrucks({ trucks: result });
  }

  async saveTrucksMarket(market: TrucksMarket): Promise<void> {
    const staticIds = await this.truckRepo
      .createQueryBuilder('truck')
      .select('DISTINCT truck.vehicle_static_id', 'vehicle_static_id')
      .getRawMany();
    const allTypes = market.getTrucksForSale().map(t => t.vehicleStaticId);
    const seen = new Set<number>();
    for (const { vehicle_static_id } of staticIds) {
      if (typeof vehicle_static_id !== 'number') continue;
      seen.add(vehicle_static_id);
      const latest = await this.truckRepo.findOne({
        where: { vehicle_static_id },
        order: { id: 'DESC' },
      });
      if (!latest) continue;
      const t = market.getTrucksForSale().find(t => t.vehicleStaticId === vehicle_static_id);
      if (!t) continue;
      const entity = new TruckEntity();
      entity.vehicle_static_id = latest.vehicle_static_id;
      entity.cost = t.cost.amount;
      entity.weight = t.weight.value;
      entity.operatingCostPerDay = t.operatingCostPerDay.amount;
      entity.sold = false;
      await this.truckRepo.save(entity);
    }
    // Initial seed for types not yet in the table
    for (const vehicle_static_id of allTypes) {
      if (seen.has(vehicle_static_id)) continue;
      const t = market.getTrucksForSale().find(t => t.vehicleStaticId === vehicle_static_id);
      if (!t) continue;
      const entity = new TruckEntity();
      entity.vehicle_static_id = vehicle_static_id;
      entity.cost = t.cost.amount;
      entity.weight = t.weight.value;
      entity.operatingCostPerDay = t.operatingCostPerDay.amount;
      entity.sold = false;
      await this.truckRepo.save(entity);
    }
  }

  async createMarket(simulationId: number): Promise<number> {
    return 1;
  }

  // Order repository methods
  async saveOrder(order: Order): Promise<Order> {
    let result;
    if (order.id) {
      result = await this.orderRepo.save(order);
    } else {
      result = await this.orderRepo.save(order);
    }
    return result;
  }

  async findOrderById(orderId: number): Promise<Order | null> {
    return this.orderRepo.findOneBy({ id: orderId });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.find({ order: { orderDate: 'DESC' } });
  }

  // Methods to mark individual items as sold
  async markTrucksAsSold(vehicle_static_id: number, quantity: number): Promise<number[]> {
    // Find available trucks of the specified type that are not sold
    const result = await this.truckRepo.find({
      where: { vehicle_static_id, sold: false },
      order: { id: 'ASC' },
      take: quantity
    });

    if (result.length < quantity) {
      throw new Error(`Not enough trucks available. Requested: ${quantity}, Available: ${result.length}`);
    }

    const truckIds = result.map(row => row.id);
    await this.truckRepo.update(truckIds, { sold: true });

    return truckIds;
  }

  async markMachinesAsSold(machine_static_id: number, quantity: number): Promise<number[]> {
    const result = await this.machineRepo.find({
      where: { machine_static_id },
      order: { id: 'ASC' },
      take: quantity
    });

    if (result.length < quantity) {
      throw new Error(`Not enough machines available. Requested: ${quantity}, Available: ${result.length}`);
    }

    const machineIds = result.map(row => row.id);
    await this.machineRepo.update(machineIds, { sold: true });

    return machineIds;
  }

  async reduceRawMaterialWeight(materialName: string, weightToReduce: number): Promise<number> {
    // Look up material_static_id from material_static table
    const staticResult = await this.materialStaticRepo.findOneBy({ name: materialName });
    if (!staticResult) {
      throw new Error(`Material '${materialName}' not found in static table`);
    }
    const material_static_id = staticResult.id;
    const result = await this.rawMaterialRepo.findOneBy({ material_static_id });
    if (!result) {
      throw new Error(`Raw material with static id '${material_static_id}' not found in market`);
    }
    const available = Number(result.availableWeight);
    const toReduce = Number(weightToReduce);
    if (available < toReduce) {
      throw new Error(`Not enough material available. Requested: ${toReduce}, Available: ${available}`);
    }
    await this.rawMaterialRepo.update({ id: result.id }, { availableWeight: available - toReduce });
    return result.id;
  }

  async saveCollection(collection: Collection): Promise<Collection> {
    const result = await this.collectionRepo.save(collection);
    return result;
  }

  async findCollectionByOrderId(orderId: number): Promise<Collection | null> {
    const result = await this.collectionRepo.findOneBy({ orderId });
    if (!result) return null;
    return result;
  }

  async getAllCollections(): Promise<Collection[]> {
    const result = await this.collectionRepo.find({ order: { orderDate: 'DESC' } });
    return result;
  }

  async markCollectionAsCollected(orderId: number): Promise<void> {
    const result = await this.collectionRepo.update({ orderId }, { collected: true, collectionDate: new Date() });

    if (result.affected === 0) {
      throw new Error(`Collection for order ${orderId} not found`);
    }
  }

  async collectFromCollection(orderId: number, collectQuantity: number): Promise<Collection> {
    const currentCollection = await this.collectionRepo.findOneBy({ orderId });
    if (!currentCollection) {
      throw new Error(`Collection for order ${orderId} not found`);
    }
    if (currentCollection.collected) {
      throw new Error(`Collection for order ${orderId} has already been fully collected`);
    }
    const currentCollected = Number(currentCollection.amountCollected);
    const totalQuantity = Number(currentCollection.quantity);
    const newCollected = currentCollected + collectQuantity;
    if (newCollected > totalQuantity) {
      throw new Error(`Cannot collect ${collectQuantity} items. Would exceed total quantity of ${totalQuantity} (already collected: ${currentCollected}).`);
    }
    const shouldMarkCollected = newCollected === totalQuantity;
    if (shouldMarkCollected) {
      await this.orderRepo.update({ id: orderId }, { status: 'completed' });
    }
    await this.collectionRepo.update({ orderId }, { amountCollected: newCollected, collected: shouldMarkCollected });
    const updatedCollection = await this.collectionRepo.findOneBy({ orderId });
    if (!updatedCollection) {
      throw new Error(`Failed to fetch updated collection for order ${orderId}`);
    }
    return updatedCollection;
  }

  async findLatestMachinesMarket(): Promise<MachinesMarket | null> {
    const result = await this.machineRepo.find({
      order: { id: 'DESC' }
    });
    if (result.length === 0) return null;
    return await MarketMapper.fromDbMachines({ machines: result });
  }

  async findLatestTrucksMarket(): Promise<TrucksMarket | null> {
    const result = await this.truckRepo.find({
      order: { id: 'DESC' }
    });
    if (result.length === 0) return null;
    return await MarketMapper.fromDbTrucks({ trucks: result });
  }

  async findLatestRawMaterialsMarket(): Promise<RawMaterialsMarket | null> {
    const result = await this.rawMaterialRepo.find({
      order: { id: 'DESC' }
    });
    if (result.length === 0) return null;
    return MarketMapper.fromDbRawMaterials({ rawMaterials: result });
  }
}
