import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMachineMaterialRatioFK1751828335849 implements MigrationInterface {
    name = 'FixMachineMaterialRatioFK1751828335849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old FK if exists
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine_market"`);
        // Rename column
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" RENAME COLUMN "machine_market_id" TO "machine_static_id"`);
        // Add new FK
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD CONSTRAINT "FK_machine_material_ratio_machine_static" FOREIGN KEY ("machine_static_id") REFERENCES "machine_static"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" DROP CONSTRAINT IF EXISTS "FK_machine_material_ratio_machine_static"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" RENAME COLUMN "machine_static_id" TO "machine_market_id"`);
        await queryRunner.query(`ALTER TABLE "machine_material_ratio" ADD CONSTRAINT "FK_machine_material_ratio_machine_market" FOREIGN KEY ("machine_market_id") REFERENCES "machine_market"("id") ON DELETE CASCADE`);
    }
} 