import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveMaterialRatioDescriptionAndClarifyMaterialRatioFormat1751828335842 implements MigrationInterface {
    name = 'RemoveMaterialRatioDescriptionAndClarifyMaterialRatioFormat1751828335842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove the materialRatioDescription column
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN IF EXISTS "materialRatioDescription"`);
        // Add a comment to the materialRatio column
        await queryRunner.query(`COMMENT ON COLUMN "machine"."materialRatio" IS 'Format: material1:amount1,material2:amount2,... e.g. copper:2,plastic:5,gold:1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the materialRatioDescription column
        await queryRunner.query(`ALTER TABLE "machine" ADD "materialRatioDescription" character varying`);
        // Remove the comment from the materialRatio column
        await queryRunner.query(`COMMENT ON COLUMN "machine"."materialRatio" IS NULL`);
    }
} 