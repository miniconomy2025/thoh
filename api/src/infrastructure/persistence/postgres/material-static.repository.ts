import { pool } from './client';

export class MaterialStaticRepository {
    async findAll() {
        const result = await pool.query('SELECT * FROM material_static');
        return result.rows;
    }
} 