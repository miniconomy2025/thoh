import { VehicleStatic } from '../../../domain/market/vehicle-static.entity';
import { pool } from './client';

export class VehicleStaticRepository {
    async findAll():Promise<VehicleStatic[]> {
        const result = await pool.query('SELECT * FROM vehicle_static');
        return result.rows;
    }
} 