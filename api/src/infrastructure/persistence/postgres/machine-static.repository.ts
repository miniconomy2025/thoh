import { pool } from './client';

export class MachineStaticRepository {
    async findAll() {
        const result = await pool.query('SELECT * FROM machine_static');
        return result.rows;
    }
} 