import { IPopulationRepository } from '../../../application/ports/repository.ports';
import { Population } from '../../../domain/population/population.aggregate';
import { pool } from './client';
import { PopulationMapper } from './population.mapper';

export class PgPopulationRepository implements IPopulationRepository {
  async find(): Promise<Population | null> {
    // const result = await pool.query('SELECT * FROM population WHERE id = $1 LIMIT 1', ['singleton']);
    // if (result.rows.length === 0) return null;
    // return PopulationMapper.fromDb(result.rows[0]);
    return null;
  }

  async save(population: Population): Promise<void> {
    const data = PopulationMapper.toDb(population);
    await pool.query(`
      INSERT INTO population (simulationId)
      VALUES ($1)
    `, [
    ]);
  }
} 