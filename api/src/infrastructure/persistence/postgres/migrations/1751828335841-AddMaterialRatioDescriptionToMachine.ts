import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaterialRatioDescriptionToMachine1751828335841 implements MigrationInterface {
    name = 'AddMaterialRatioDescriptionToMachine1751828335841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machine" ADD "materialRatioDescription" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "materialRatioDescription"`);
    }
} 