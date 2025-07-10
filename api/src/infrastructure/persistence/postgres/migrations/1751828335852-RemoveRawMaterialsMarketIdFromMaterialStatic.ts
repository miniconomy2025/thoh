import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRawMaterialsMarketIdFromMaterialStatic1751828335852 implements MigrationInterface {
    name = 'RemoveRawMaterialsMarketIdFromMaterialStatic1751828335852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_static" DROP COLUMN IF EXISTS "raw_materials_market_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_static" ADD COLUMN "raw_materials_market_id" integer`);
    }
} 