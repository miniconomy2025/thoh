import { MigrationInterface, QueryRunner } from "typeorm";

export class MarketTablesReferenceStatic1751828335846 implements MigrationInterface {
    name = 'MarketTablesReferenceStatic1751828335846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // VEHICLE MARKET
        await queryRunner.query(`ALTER TABLE "vehicle_market" DROP COLUMN IF EXISTS "type"`);
        await queryRunner.query(`ALTER TABLE "vehicle_market" ADD "vehicle_static_id" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_market" ADD CONSTRAINT "FK_vehicle_market_vehicle_static" FOREIGN KEY ("vehicle_static_id") REFERENCES "vehicle_static"("id") ON DELETE SET NULL`);

        // MACHINE MARKET
        await queryRunner.query(`ALTER TABLE "machine_market" DROP COLUMN IF EXISTS "type"`);
        await queryRunner.query(`ALTER TABLE "machine_market" ADD "machine_static_id" integer`);
        await queryRunner.query(`ALTER TABLE "machine_market" ADD CONSTRAINT "FK_machine_market_machine_static" FOREIGN KEY ("machine_static_id") REFERENCES "machine_static"("id") ON DELETE SET NULL`);

        // RAW MATERIALS MARKET
        await queryRunner.query(`ALTER TABLE "raw_materials_market" DROP COLUMN IF EXISTS "name"`);
        await queryRunner.query(`ALTER TABLE "raw_materials_market" ADD "material_static_id" integer`);
        await queryRunner.query(`ALTER TABLE "raw_materials_market" ADD CONSTRAINT "FK_raw_materials_market_material_static" FOREIGN KEY ("material_static_id") REFERENCES "material_static"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // RAW MATERIALS MARKET
        await queryRunner.query(`ALTER TABLE "raw_materials_market" DROP CONSTRAINT IF EXISTS "FK_raw_materials_market_material_static"`);
        await queryRunner.query(`ALTER TABLE "raw_materials_market" DROP COLUMN IF EXISTS "material_static_id"`);
        await queryRunner.query(`ALTER TABLE "raw_materials_market" ADD "name" varchar`);

        // MACHINE MARKET
        await queryRunner.query(`ALTER TABLE "machine_market" DROP CONSTRAINT IF EXISTS "FK_machine_market_machine_static"`);
        await queryRunner.query(`ALTER TABLE "machine_market" DROP COLUMN IF EXISTS "machine_static_id"`);
        await queryRunner.query(`ALTER TABLE "machine_market" ADD "type" varchar`);

        // VEHICLE MARKET
        await queryRunner.query(`ALTER TABLE "vehicle_market" DROP CONSTRAINT IF EXISTS "FK_vehicle_market_vehicle_static"`);
        await queryRunner.query(`ALTER TABLE "vehicle_market" DROP COLUMN IF EXISTS "vehicle_static_id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_market" ADD "type" varchar`);
    }
} 