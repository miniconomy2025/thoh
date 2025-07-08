import { ISimulationRepository } from '../../../application/ports/repository.ports';
import { Simulation } from '../../../domain/simulation/simulation.aggregate';
import { pool } from './client';
import { SimulationMapper } from './simulation.mapper';

export class PgSimulationRepository implements ISimulationRepository {
  async findById(simulationId: number): Promise<Simulation | null> {
    const result = await pool.query('SELECT * FROM simulation WHERE id = $1 LIMIT 1', [simulationId]);
    if (result.rows.length === 0) return null;
    return SimulationMapper.fromDb(result.rows[0]);
  }

  async save(simulation: Simulation): Promise<number> {
    const data = SimulationMapper.toDb(simulation);
    if (!simulation.id || simulation.id === 0) {
      const result = await pool.query(`
        INSERT INTO simulation (status, "currentDay", "unixEpochStartTime")
        VALUES ($1, $2, $3)
        RETURNING id
      `, [
        data.status,
        data.currentDay,
        data.unixEpochStartTime
      ]);
      return result.rows[0].id;
    } else {
      const result = await pool.query(`
        INSERT INTO simulation (id, status, "currentDay", "unixEpochStartTime")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          "currentDay" = EXCLUDED."currentDay",
          "unixEpochStartTime" = EXCLUDED."unixEpochStartTime"
        RETURNING id
      `, [
        simulation.id,
        data.status,
        data.currentDay,
        data.unixEpochStartTime
      ]);
      return result.rows[0].id;
    }
  }
} 