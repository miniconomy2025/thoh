import { IMarketRepository } from '../../../application/ports/repository.ports';
import { RawMaterialsMarket, MachinesMarket, VehiclesMarket } from '../../../domain/market/market.aggregate';
import { pool } from './client';
import { MarketMapper } from './market.mapper';

export class PgMarketRepository implements IMarketRepository {
  async findRawMaterialsMarket(marketId: number): Promise<RawMaterialsMarket | null> {
    const result = await pool.query('SELECT * FROM raw_material WHERE "marketId" = $1', [marketId]);
    if (result.rows.length === 0) return null;
    return MarketMapper.fromDbRawMaterials({ rawMaterials: result.rows });
  }

  async saveRawMaterialsMarket(market: RawMaterialsMarket): Promise<void> {
    const materials = market.getRawMaterials();
    for (const m of materials) {
      if (m.marketId === undefined || m.marketId === null) {
        throw new Error('Cannot save raw material with null/undefined marketId');
      }
      await pool.query(`
        INSERT INTO raw_material (name, "costPerKg", "availableWeight", "marketId")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          "costPerKg" = EXCLUDED."costPerKg",
          "availableWeight" = EXCLUDED."availableWeight",
          "marketId" = EXCLUDED."marketId"
      `, [m.name, m.costPerKg, m.availableWeight, m.marketId]);
    }
  }

  async findMachinesMarket(marketId: number): Promise<MachinesMarket | null> {
    const result = await pool.query('SELECT * FROM machine WHERE "marketId" = $1', [marketId]);
    if (result.rows.length === 0) return null;
    return await MarketMapper.fromDbMachines({ machines: result.rows });
  }

  async saveMachinesMarket(market: MachinesMarket): Promise<void> {
       const machines = market.getMachinesForSale();
    for (const m of machines) {
      if (m.marketId === undefined || m.marketId === null) {
        throw new Error('Cannot save machine with null/undefined marketId');
      }
      if (!m.cost || typeof m.cost.amount !== 'number' || isNaN(m.cost.amount)) {
        throw new Error('Cannot save machine with null/invalid cost');
      }
      if (!m.weight || typeof m.weight.value !== 'number' || isNaN(m.weight.value)) {
        throw new Error('Cannot save machine with null/invalid weight');
      }
      await pool.query(`
        INSERT INTO machine (type, cost, weight, "productionRatio", "marketId")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "productionRatio" = EXCLUDED."productionRatio",
          "marketId" = EXCLUDED."marketId"
      `, [ m.type, m.cost.amount, m.weight.value, m.productionRatio, m.marketId]);
    }
  }

  async findVehiclesMarket(marketId: number): Promise<VehiclesMarket | null> {
    const result = await pool.query('SELECT * FROM vehicle WHERE "marketId" = $1', [marketId]);
    if (result.rows.length === 0) return null;
    return await MarketMapper.fromDbVehicles({ vehicles: result.rows });
  }

  async saveVehiclesMarket(market: VehiclesMarket): Promise<void> {
    const vehicles = market.getVehiclesForSale();
    for (const v of vehicles) {
      if (v.marketId === undefined || v.marketId === null) {
        throw new Error('Cannot save vehicle with null/undefined marketId');
      }
      await pool.query(`
        INSERT INTO vehicle ( type, cost, weight, "operatingCostPerDay", "marketId")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          cost = EXCLUDED.cost,
          weight = EXCLUDED.weight,
          "operatingCostPerDay" = EXCLUDED."operatingCostPerDay",
          "marketId" = EXCLUDED."marketId"
      `, [v.type, v.cost.amount, v.weight.value, v.operatingCostPerDay.amount, v.marketId]);
    }
  }

  async createMarket(simulationId: number): Promise<number> {
    const result = await pool.query('INSERT INTO market ("simulationId") VALUES ($1) RETURNING id', [simulationId]);
    return result.rows[0].id;
  }
} 