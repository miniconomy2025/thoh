import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSimulationIdToPopulation1751828335860 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "population"
            ADD COLUMN "simulationId" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "population"
            DROP COLUMN "simulationId"
        `);
    }
} 