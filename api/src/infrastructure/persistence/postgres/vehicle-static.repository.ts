import { pool } from './client';

export class VehicleStaticRepository {
    async findAll() {
        const result = await pool.query('SELECT * FROM vehicle_static');
        return result.rows;
    }
} 