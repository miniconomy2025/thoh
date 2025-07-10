import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateStaticTables1751828335847 implements MigrationInterface {
    name = 'PopulateStaticTables1751828335847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Populate material_static
        await queryRunner.query(`
            INSERT INTO material_static (name, description) VALUES
            ('copper', 'Copper material'),
            ('silicon', 'Silicon material'),
            ('sand', 'Sand material'),
            ('plastic', 'Plastic material'),
            ('aluminium', 'Aluminium material')
        `);

        // Populate machine_static
        await queryRunner.query(`
            INSERT INTO machine_static (name, description) VALUES
            ('electronics_machine', 'copper : silicon'),
            ('ephone_machine', 'cases : screens : electronics'),
            ('ephone_plus_machine', 'cases : screens : electronics'),
            ('ephone_pro_max_machine', 'cases : screens : electronics'),
            ('cosmos_z25_machine', 'cases : screens : electronics'),
            ('cosmos_z25_ultra_machine', 'cases : screens : electronics'),
            ('cosmos_z25_fe_machine', 'cases : screens : electronics'),
            ('case_machine', 'plastic : aluminium'),
            ('screen_machine', 'copper : sand'),
            ('recycling_machine', 'can recycle any phone')
        `);

        // Populate phone_static
        await queryRunner.query(`
            INSERT INTO phone_static (name, description) VALUES
            ('ePhone', 'ePhone base model'),
            ('ePhone_plus', 'ePhone Plus model'),
            ('ePhone_pro_max', 'ePhone Pro Max model'),
            ('Cosmos_Z25', 'Cosmos Z25 base model'),
            ('Cosmos_Z25_ultra', 'Cosmos Z25 Ultra model'),
            ('Cosmos_Z25_FE', 'Cosmos Z25 Fan Edition')
        `);

        // Populate vehicle_static (example entries)
        await queryRunner.query(`
            INSERT INTO vehicle_static (name, description) VALUES
            ('large_truck', 'Large truck for heavy loads'),
            ('medium_truck', 'Medium truck for moderate loads'),
            ('small_truck', 'Small truck for light loads')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM phone_static`);
        await queryRunner.query(`DELETE FROM vehicle_static`);
        await queryRunner.query(`DELETE FROM machine_static`);
        await queryRunner.query(`DELETE FROM material_static`);
    }
} 