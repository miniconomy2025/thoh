import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMachineMaterialRatioTable1751828335843 implements MigrationInterface {
    name = 'CreateMachineMaterialRatioTable1751828335843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "machine_material_ratio" (
                "id" SERIAL PRIMARY KEY,
                "machine_id" integer NOT NULL,
                "cases" numeric,
                "screens" numeric,
                "electronics" numeric,
                "copper" numeric,
                "silicon" numeric,
                "plastic" numeric,
                "aluminium" numeric,
                "sand" numeric,
                CONSTRAINT "FK_machine_material_ratio_machine" FOREIGN KEY ("machine_id") REFERENCES "machine"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "machine_material_ratio"`);
    }
} 