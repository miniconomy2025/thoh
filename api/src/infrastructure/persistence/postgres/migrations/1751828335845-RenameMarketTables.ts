import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameMarketTables1751828335845 implements MigrationInterface {
    name = 'RenameMarketTables1751828335845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename main tables
        await queryRunner.query(`ALTER TABLE "vehicle" RENAME TO "vehicle_market"`);
        await queryRunner.query(`ALTER TABLE "raw_material" RENAME TO "raw_materials_market"`);
        await queryRunner.query(`ALTER TABLE "machine" RENAME TO "machine_market"`);

        // Update FKs in static tables
        await queryRunner.query(`ALTER TABLE "vehicle_static" DROP CONSTRAINT IF EXISTS "FK_vehicle_static_vehicle"`);
        await queryRunner.query(`ALTER TABLE "vehicle_static" RENAME COLUMN "vehicle_id" TO "vehicle_market_id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_static" ADD CONSTRAINT "FK_vehicle_static_vehicle_market" FOREIGN KEY ("vehicle_market_id") REFERENCES "vehicle_market"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "material_static" DROP CONSTRAINT IF EXISTS "FK_material_static_material"`);
        await queryRunner.query(`ALTER TABLE "material_static" RENAME COLUMN "material_id" TO "raw_materials_market_id"`);
        await queryRunner.query(`ALTER TABLE "material_static" ADD CONSTRAINT "FK_material_static_raw_materials_market" FOREIGN KEY ("raw_materials_market_id") REFERENCES "raw_materials_market"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "machine_static" DROP CONSTRAINT IF EXISTS "FK_machine_static_machine"`);
        await queryRunner.query(`ALTER TABLE "machine_static" RENAME COLUMN "machine_id" TO "machine_market_id"`);
        await queryRunner.query(`ALTER TABLE "machine_static" ADD CONSTRAINT "FK_machine_static_machine_market" FOREIGN KEY ("machine_market_id") REFERENCES "machine_market"("id") ON DELETE SET NULL`);

        // Update FKs in join tables
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" RENAME COLUMN "machine_id" TO "machine_market_id"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD CONSTRAINT "FK_machine_material_ratio_machine_market" FOREIGN KEY ("machine_market_id") REFERENCES "machine_market"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert join table FKs
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine_market"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" RENAME COLUMN "machine_market_id" TO "machine_id"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD CONSTRAINT "FK_machine_material_ratio_machine" FOREIGN KEY ("machine_id") REFERENCES "machine"("id") ON DELETE CASCADE`);

        // Revert static table FKs
        await queryRunner.query(`ALTER TABLE "machine_static" DROP CONSTRAINT IF EXISTS "FK_machine_static_machine_market"`);
        await queryRunner.query(`ALTER TABLE "machine_static" RENAME COLUMN "machine_market_id" TO "machine_id"`);
        await queryRunner.query(`ALTER TABLE "machine_static" ADD CONSTRAINT "FK_machine_static_machine" FOREIGN KEY ("machine_id") REFERENCES "machine"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "material_static" DROP CONSTRAINT IF EXISTS "FK_material_static_raw_materials_market"`);
        await queryRunner.query(`ALTER TABLE "material_static" RENAME COLUMN "raw_materials_market_id" TO "material_id"`);
        await queryRunner.query(`ALTER TABLE "material_static" ADD CONSTRAINT "FK_material_static_material" FOREIGN KEY ("material_id") REFERENCES "raw_material"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "vehicle_static" DROP CONSTRAINT IF EXISTS "FK_vehicle_static_vehicle_market"`);
        await queryRunner.query(`ALTER TABLE "vehicle_static" RENAME COLUMN "vehicle_market_id" TO "vehicle_id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_static" ADD CONSTRAINT "FK_vehicle_static_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE SET NULL`);

        // Revert main tables
        await queryRunner.query(`ALTER TABLE "machine_market" RENAME TO "machine"`);
        await queryRunner.query(`ALTER TABLE "raw_materials_market" RENAME TO "raw_material"`);
        await queryRunner.query(`ALTER TABLE "vehicle_market" RENAME TO "vehicle"`);
    }
} 