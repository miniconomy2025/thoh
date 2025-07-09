import { pool } from './client';
import { Currency } from '../../../domain/population/currency.entity';

export class PgCurrencyRepository {
  async findAll(): Promise<Currency[]> {
    const result = await pool.query('SELECT * FROM currency');
    return result.rows.map((row: Record<string, unknown>) => ({
      code: row.code as string,
      description: row.description as string,
    }));
  }

  async findByCode(code: string): Promise<Currency | null> {
    const result = await pool.query('SELECT * FROM currency WHERE code = $1', [code]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      code: row.code,
      description: row.description
    };
  }

  async getDefaultCurrency(): Promise<Currency | null> {
    return this.findByCode('D');
  }
} 