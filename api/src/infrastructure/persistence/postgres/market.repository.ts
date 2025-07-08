import { IMarketRepository } from '../../../application/ports/repository.ports';
import { RawMaterialsMarket, MachinesMarket, TrucksMarket } from '../../../domain/market/market.aggregate';
import { Order } from '../../../domain/market/order.entity';
import { pool } from './client';
import { MarketMapper } from './market.mapper';

export class PgMarketRepository implements IMarketRepository {
  async findRawMaterialsMarket(): Promise<RawMaterialsMarket | null> {
    const result = await pool.query('SELECT * FROM raw_materials_market');
    if (result.rows.length === 0) return null;
    return MarketMapper.fromDbRawMaterials({ rawMaterials: result.rows });
  }

  async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
    const materials = market.getRawMaterials();
    for (const m of materials) {
      await pool.query(`
        INSERT INTO raw_materials_market (material_static_id, "costPerKg", "availableWeight")
        VALUES ($1, $2, $3)
      `, [m.material_static_id, m.costPerKg, m.availableWeight]);
    }
  }

  async findMachinesMarket(): Promise<MachinesMarket | null> {
    // Join machine_static, machine_material_ratio, and machine_market
    const result = await pool.query(`
      SELECT ms.id as static_id, ms.name, ms.description, m.id as machine_id, m.machine_static_id, m.cost, m.weight, m."productionRate", m.quantity,
             mmr.cases, mmr.screens, mmr.electronics, mmr.copper, mmr.silicon, mmr.plastic, mmr.aluminium, mmr.sand
      FROM machine_static ms
      JOIN machine_market m ON ms.id = m.machine_static_id
      LEFT JOIN machine_material_ratio mmr ON mmr.machine_static_id = m.machine_static_id
    `);
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
        INSERT INTO machine_market (machine_static_id, cost, weight, "materialRatio", "productionRate", "quantity")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          machine_static_id = EXCLUDED.machine_static_id,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "materialRatio" = EXCLUDED."materialRatio",
          "productionRate" = EXCLUDED."productionRate",
          "quantity" = EXCLUDED."quantity"
      `, [ m.machineStaticId, m.cost.amount, m.weight.value, JSON.stringify(m.materialRatio), m.productionRate, m.quantity]);
    }
  }

  async findTrucksMarket(): Promise<TrucksMarket | null> {
    const result = await pool.query('SELECT * FROM vehicle_market');
    if (result.rows.length === 0) return null;
    return await MarketMapper.fromDbTrucks({ trucks: result.rows });
  }

  async saveTrucksMarket(market: TrucksMarket): Promise<void> {
    const trucks = market.getTrucksForSale();
    for (const t of trucks) {
      await pool.query(`
        INSERT INTO vehicle_market (vehicle_static_id, cost, weight, "operatingCostPerDay", quantity)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          vehicle_static_id = EXCLUDED.vehicle_static_id,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "operatingCostPerDay" = EXCLUDED."operatingCostPerDay",
          quantity = EXCLUDED.quantity
      `, [t.vehicleStaticId, t.cost.amount, t.weight.value, t.operatingCostPerDay.amount, t.quantity]);
    }
  }

  async createMarket(simulationId: number): Promise<number> {
    return 1;
  }

  // Order repository methods
  async saveOrder(order: Order): Promise<Order> {
    let result;
    if (order.id) {
      // Update existing order
      result = await pool.query(`
        UPDATE orders SET
          "itemName" = $1,
          "itemId" = $2,
          quantity = $3,
          "unitPrice" = $4,
          "totalPrice" = $5,
          currency = $6,
          "orderDate" = $7,
          status = $8,
          "item_type_id" = $9,
          "marketId" = $10
        WHERE id = $11
        RETURNING *
      `, [
        order.itemName,
        order.itemId,
        order.quantity,
        order.unitPrice,
        order.totalPrice,
        order.currency,
        order.orderDate,
        order.status,
        order.item_type_id,
        order.marketId,
        order.id
      ]);
    } else {
      // Insert new order
      result = await pool.query(`
        INSERT INTO orders ("itemName", "itemId", quantity, "unitPrice", "totalPrice", currency, "orderDate", status, "item_type_id", "marketId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        order.itemName,
        order.itemId,
        order.quantity,
        order.unitPrice,
        order.totalPrice,
        order.currency,
        order.orderDate,
        order.status,
        order.item_type_id,
        order.marketId
      ]);
    }

    const savedOrder = result.rows[0];
    const newOrder = new Order(
      savedOrder.itemName,
      Number(savedOrder.quantity),
      Number(savedOrder.unitPrice),
      Number(savedOrder.totalPrice),
      savedOrder.currency,
      savedOrder.status,
      savedOrder.itemId,
      savedOrder.marketId
    );
    newOrder.id = savedOrder.id;
    newOrder.orderDate = new Date(savedOrder.orderDate);
    newOrder.item_type_id = savedOrder.item_type_id;
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
      orderData.itemId,
      orderData.marketId
    );
    order.id = orderData.id;
    order.orderDate = new Date(orderData.orderDate);
    order.item_type_id = orderData.item_type_id;
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
        orderData.itemId,
        orderData.marketId
      );
      order.id = orderData.id;
      order.orderDate = new Date(orderData.orderDate);
      order.item_type_id = orderData.item_type_id;
      return order;
    });
  }

  // Methods to mark individual items as sold
  async markTrucksAsSold(vehicleStaticId: number, quantity: number): Promise<number[]> {
    // Find available trucks of the specified type that are not sold
    const result = await pool.query(`
      SELECT id FROM vehicle_market 
      WHERE vehicle_static_id = $1 AND sold = false 
      ORDER BY id 
      LIMIT $2
    `, [vehicleStaticId, quantity]);

    if (result.rows.length < quantity) {
      throw new Error(`Not enough trucks available. Requested: ${quantity}, Available: ${result.rows.length}`);
    }

    const truckIds = result.rows.map(row => row.id);
    await pool.query(`
      UPDATE vehicle_market 
      SET sold = true 
      WHERE id = ANY($1)
    `, [truckIds]);

    return truckIds;
  }

  async markMachinesAsSold(machineStaticId: number, quantity: number): Promise<number[]> {
    const result = await pool.query(`
      SELECT id FROM machine_market 
      WHERE machine_static_id = $1 AND sold = false 
      ORDER BY id 
      LIMIT $2
    `, [machineStaticId, quantity]);

    if (result.rows.length < quantity) {
      throw new Error(`Not enough machines available. Requested: ${quantity}, Available: ${result.rows.length}`);
    }

    const machineIds = result.rows.map(row => row.id);
    await pool.query(`
      UPDATE machine_market 
      SET sold = true 
      WHERE id = ANY($1)
    `, [machineIds]);

    return machineIds;
  }

  async reduceRawMaterialWeight(materialName: string, weightToReduce: number): Promise<number> {
    // First, look up the material_static_id for the given material name
    const staticResult = await pool.query(`
      SELECT id FROM material_static WHERE name = $1
    `, [materialName]);

    if (staticResult.rows.length === 0) {
      throw new Error(`Material '${materialName}' not found in static table`);
    }
    const materialStaticId = staticResult.rows[0].id;

    // Now query raw_materials_market using the material_static_id
    const result = await pool.query(`
      SELECT id, "availableWeight", "costPerKg" FROM raw_materials_market 
      WHERE material_static_id = $1
    `, [materialStaticId]);

    if (result.rows.length === 0) {
      throw new Error(`Raw material '${materialName}' not found in market`);
    }

    const material = result.rows[0];
    
    if (material.availableWeight < weightToReduce) {
      throw new Error(`Not enough ${materialName} available. Requested: ${weightToReduce}kg, Available: ${material.availableWeight}kg`);
    }

    // Update the available weight by reducing it
    const updateResult = await pool.query(`
      UPDATE raw_materials_market 
      SET "availableWeight" = "availableWeight" - $1
      WHERE material_static_id = $2
      RETURNING id, "availableWeight"
    `, [weightToReduce, materialStaticId]);

    return updateResult.rows[0].id;
  }

  async saveCollection(collection: any): Promise<any> {
    const result = await pool.query(`
      INSERT INTO collection ("orderId", "itemName", "itemId", "quantity", "amountCollected", "orderDate", collected)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      collection.orderId,
      collection.itemName,
      collection.itemId,
      collection.quantity,
      collection.amountCollected,
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

  async collectFromCollection(orderId: number, collectQuantity: number): Promise<any> {
    const currentCollection = await pool.query(
      'SELECT "amountCollected", quantity, collected FROM collection WHERE "orderId" = $1',
      [orderId]
    );
    
    if (currentCollection.rows.length === 0) {
      throw new Error(`Collection for order ${orderId} not found`);
    }
    
    const current = currentCollection.rows[0];
    
    if (current.collected) {
      throw new Error(`Collection for order ${orderId} has already been fully collected`);
    }
    
    const currentCollected = Number(current.amountCollected);
    const totalQuantity = Number(current.quantity);
    const newCollected = currentCollected + collectQuantity;
    
    if (newCollected > totalQuantity) {
      throw new Error(`Cannot collect ${collectQuantity} items. Would exceed total quantity of ${totalQuantity} (already collected: ${currentCollected}).`);
    }
    
    const shouldMarkCollected = newCollected === totalQuantity;
    
    if (shouldMarkCollected) {
      await pool.query(
        `UPDATE orders SET status = 'completed' WHERE id = $1`,
        [orderId]
      );
    }
    
    const result = await pool.query(
      `UPDATE collection 
       SET "amountCollected" = $1, 
           collected = $2
       WHERE "orderId" = $3 
       RETURNING *`,
      [newCollected, shouldMarkCollected, orderId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Failed to update collection for order ${orderId}`);
    }
    
    return result.rows[0];
  }
}
