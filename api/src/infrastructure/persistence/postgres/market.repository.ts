import { IMarketRepository } from '../../../application/ports/repository.ports';
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../../domain/market/market.aggregate';
import { Order } from '../../../domain/market/order.entity';
import { pool } from './client';
import { MarketMapper } from './market.mapper';

export class PgMarketRepository implements IMarketRepository {
  async findRawMaterialsMarket(): Promise<RawMaterialsMarket | null> {
    const result = await pool.query('SELECT * FROM raw_material' );
    if (result.rows.length === 0) return null;
    return MarketMapper.fromDbRawMaterials({ rawMaterials: result.rows });
  }

  async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
    const materials = market.getRawMaterials();
    for (const m of materials) {
      await pool.query(`
        INSERT INTO raw_material (name, "costPerKg", "availableWeight")
        VALUES ($1, $2, $3)
      `, [m.name, m.costPerKg, m.availableWeight]);
    }
  }

  async findMachinesMarket(): Promise<MachinesMarket | null> {
    const result = await pool.query('SELECT * FROM machine');
    if (result.rows.length === 0) return null;
    return await MarketMapper.fromDbMachines({ machines: result.rows });
  }

  async saveMachinesMarket(market: MachinesMarket): Promise<void> {
       const machines = market.getMachinesForSale();
    for (const m of machines) {
      if (!m.cost || typeof m.cost.amount !== 'number' || isNaN(m.cost.amount)) {
        throw new Error('Cannot save machine with null/invalid cost');
      }
      if (!m.weight || typeof m.weight.value !== 'number' || isNaN(m.weight.value)) {
        throw new Error('Cannot save machine with null/invalid weight');
      }
      await pool.query(`
        INSERT INTO machine (type, cost, weight, "materialRatio", "productionRate", "quantity")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "materialRatio" = EXCLUDED."materialRatio",
          "productionRate" = EXCLUDED."productionRate",
          "quantity" = EXCLUDED."quantity"
      `, [ m.type, m.cost.amount, m.weight.value, m.materialRatio, m.productionRate, m.quantity]);
    }
  }

  async findTrucksMarket(): Promise<TrucksMarket | null> {
    const result = await pool.query('SELECT * FROM vehicle');
    if (result.rows.length === 0) return null;
    return await MarketMapper.fromDbTrucks({ trucks: result.rows });
  }

  async saveTrucksMarket(market: TrucksMarket): Promise<void> {
    const trucks = market.getTrucksForSale();
    for (const t of trucks) {
      await pool.query(`
        INSERT INTO vehicle ( type, cost, weight, "operatingCostPerDay", quantity)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "operatingCostPerDay" = EXCLUDED."operatingCostPerDay",
          quantity = EXCLUDED.quantity
      `, [t.type, t.cost.amount, t.weight.value, t.operatingCostPerDay.amount, t.quantity]);
    }
  }

  async createMarket(simulationId: number): Promise<number> {
    return 1;
  }

  // Order repository methods
  async saveOrder(order: Order): Promise<Order> {
    const result = await pool.query(`
      INSERT INTO orders ("itemName", "itemId", quantity, "unitPrice", "totalPrice", currency, "orderDate", status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      order.itemName,
      order.itemId,
      order.quantity,
      order.unitPrice,
      order.totalPrice,
      order.currency,
      order.orderDate,
      order.status
    ]);

    const savedOrder = result.rows[0];
    const newOrder = new Order(
      savedOrder.itemName,
      Number(savedOrder.quantity),
      Number(savedOrder.unitPrice),
      Number(savedOrder.totalPrice),
      savedOrder.currency,
      savedOrder.status,
      savedOrder.itemId
    );
    newOrder.id = savedOrder.id;
    newOrder.orderDate = new Date(savedOrder.orderDate);
    return newOrder;
  }

  async findOrderById(orderId: number): Promise<Order | null> {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) return null;

    const orderData = result.rows[0];
    const order = new Order(
      orderData.itemName,
      Number(orderData.quantity),
      Number(orderData.unitPrice),
      Number(orderData.totalPrice),
      orderData.currency,
      orderData.status,
      orderData.itemId
    );
    order.id = orderData.id;
    order.orderDate = new Date(orderData.orderDate);
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    const result = await pool.query('SELECT * FROM orders ORDER BY orderDate DESC');
    return result.rows.map(orderData => {
      const order = new Order(
        orderData.itemName,
        Number(orderData.quantity),
        Number(orderData.unitPrice),
        Number(orderData.totalPrice),
        orderData.currency,
        orderData.status,
        orderData.itemId
      );
      order.id = orderData.id;
      order.orderDate = new Date(orderData.orderDate);
      return order;
    });
  }



  // Methods to mark individual items as sold
  async markTrucksAsSold(truckType: string, quantity: number): Promise<number[]> {
    // Find available trucks of the specified type that are not sold
    const result = await pool.query(`
      SELECT id FROM vehicle 
      WHERE type = $1 AND sold = false 
      ORDER BY id 
      LIMIT $2
    `, [truckType, quantity]);

    if (result.rows.length < quantity) {
      throw new Error(`Not enough ${truckType} trucks available. Requested: ${quantity}, Available: ${result.rows.length}`);
    }

    const truckIds = result.rows.map(row => row.id);
    await pool.query(`
      UPDATE vehicle 
      SET sold = true 
      WHERE id = ANY($1)
    `, [truckIds]);

    return truckIds;
  }

  async markMachinesAsSold(machineType: string, quantity: number): Promise<number[]> {
    const result = await pool.query(`
      SELECT id FROM machine 
      WHERE type = $1 AND sold = false 
      ORDER BY id 
      LIMIT $2
    `, [machineType, quantity]);

    if (result.rows.length < quantity) {
      throw new Error(`Not enough ${machineType} machines available. Requested: ${quantity}, Available: ${result.rows.length}`);
    }

    const machineIds = result.rows.map(row => row.id);
    await pool.query(`
      UPDATE machine 
      SET sold = true 
      WHERE id = ANY($1)
    `, [machineIds]);

    return machineIds;
  }

  async reduceRawMaterialWeight(materialName: string, weightToReduce: number): Promise<number> {
    const result = await pool.query(`
      SELECT id, "availableWeight", "costPerKg" FROM raw_material 
      WHERE name = $1
    `, [materialName]);

    if (result.rows.length === 0) {
      throw new Error(`Raw material '${materialName}' not found`);
    }

    const material = result.rows[0];
    
    if (material.availableWeight < weightToReduce) {
      throw new Error(`Not enough ${materialName} available. Requested: ${weightToReduce}kg, Available: ${material.availableWeight}kg`);
    }

    const insertResult = await pool.query(`
      INSERT INTO raw_material (name, "costPerKg", "availableWeight")
      VALUES ($1, $2, $3)
      RETURNING id, name, "availableWeight"
    `, [materialName, material.costPerKg, -weightToReduce]);

    return insertResult.rows[0].id;
  }

  async saveCollection(collection: any): Promise<any> {
    const result = await pool.query(`
      INSERT INTO collection ("orderId", "itemName", "itemId", quantity, "orderDate", collected)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      collection.orderId,
      collection.itemName,
      collection.itemId,
      collection.quantity,
      collection.orderDate,
      collection.collected
    ]);

    return result.rows[0];
  }

  async findCollectionByOrderId(orderId: number): Promise<any | null> {
    const result = await pool.query('SELECT * FROM collection WHERE "orderId" = $1', [orderId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async getAllCollections(): Promise<any[]> {
    const result = await pool.query('SELECT * FROM collection ORDER BY "orderDate" DESC');
    return result.rows;
  }

  async markCollectionAsCollected(orderId: number): Promise<void> {
    const result = await pool.query(`
      UPDATE collection 
      SET collected = true, "collectionDate" = NOW()
      WHERE "orderId" = $1
    `, [orderId]);

    if (result.rowCount === 0) {
      throw new Error(`Collection for order ${orderId} not found`);
    }
  }
}
