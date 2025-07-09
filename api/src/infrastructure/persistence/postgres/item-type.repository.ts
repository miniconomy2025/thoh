import { pool } from './client';

export class ItemTypeRepository {
    async findById(id: number) {
        const result = await pool.query('SELECT * FROM item_types WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByName(name: string) {
        const result = await pool.query('SELECT * FROM item_types WHERE name = $1', [name]);
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM item_types ORDER BY id');
        return result.rows;
    }

    async findTruckTypeId(): Promise<number> {
        const result = await this.findByName('truck');
        if (!result) {
            throw new Error('Truck item type not found in database');
        }
        return result.id;
    }

    async findMachineTypeId(): Promise<number> {
        const result = await this.findByName('machine');
        if (!result) {
            throw new Error('Machine item type not found in database');
        }
        return result.id;
    }

    async findRawMaterialTypeId(): Promise<number> {
        const result = await this.findByName('raw_material');
        if (!result) {
            throw new Error('Raw material item type not found in database');
        }
        return result.id;
    }
} 