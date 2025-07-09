import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAndSeedMachineMaterialRatio1751828335851 implements MigrationInterface {
    name = 'FixAndSeedMachineMaterialRatio1751828335851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old FK and column if they exist
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine_market"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP COLUMN IF EXISTS "machine_market_id"`);
        // FK already exists, do not add again

        // Seed the table
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, copper, silicon)
            SELECT id, 4, 3 FROM machine_static WHERE name = 'electronics_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 1, 5 FROM machine_static WHERE name = 'ephone_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 2, 7 FROM machine_static WHERE name = 'ephone_plus_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 2, 10 FROM machine_static WHERE name = 'ephone_pro_max_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 2, 5 FROM machine_static WHERE name = 'cosmos_z25_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 3, 11 FROM machine_static WHERE name = 'cosmos_z25_ultra_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, cases, screens, electronics)
            SELECT id, 1, 2, 8 FROM machine_static WHERE name = 'cosmos_z25_fe_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, plastic, aluminium)
            SELECT id, 4, 7 FROM machine_static WHERE name = 'case_machine'
        `);
        await queryRunner.query(`
            INSERT INTO machine_material_ratio (machine_static_id, copper, sand)
            SELECT id, 2, 7 FROM machine_static WHERE name = 'screen_machine'
        `);
        // recycling_machine: any_phone:1 (not a real column, skip)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM machine_material_ratio`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine_static"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP COLUMN IF EXISTS "machine_static_id"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD COLUMN "machine_market_id" integer`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD CONSTRAINT "FK_machine_material_ratio_machine_market" FOREIGN KEY ("machine_market_id") REFERENCES "machine_market"("id") ON DELETE CASCADE`);
    }
} 