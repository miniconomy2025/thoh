import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveMarketId1751479509405 implements MigrationInterface {
    name = 'RemoveMarketId1751479509405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "machine" DROP CONSTRAINT "FK_machine_market"`);
        await queryRunner.query(`ALTER TABLE "vehicle" DROP CONSTRAINT "FK_vehicle_market"`);
        await queryRunner.query(`ALTER TABLE "raw_material" DROP CONSTRAINT "FK_raw_material_market"`);

        // Drop marketId columns
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "marketId"`);
        await queryRunner.query(`ALTER TABLE "vehicle" DROP COLUMN "marketId"`);
        await queryRunner.query(`ALTER TABLE "raw_material" DROP COLUMN "marketId"`);

        // Update machine table structure
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "productionRatio"`);
        await queryRunner.query(`ALTER TABLE "machine" ADD "materialRatio" character varying NOT NULL DEFAULT '1:2:5'`);
        await queryRunner.query(`ALTER TABLE "machine" ADD "productionRate" integer NOT NULL DEFAULT 100`);
        await queryRunner.query(`ALTER TABLE "machine" ADD "quantity" integer NOT NULL DEFAULT 1`);

        // Drop the market table since it's no longer needed
        await queryRunner.query(`DROP TABLE "market"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate market table
        await queryRunner.query(`CREATE TABLE "market" ("id" SERIAL NOT NULL, "simulationId" integer NOT NULL, CONSTRAINT "PK_1e45317302e43b86b1b8b4c4c4c" PRIMARY KEY ("id"))`);

        // Add marketId columns back
        await queryRunner.query(`ALTER TABLE "machine" ADD "marketId" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle" ADD "marketId" integer`);
        await queryRunner.query(`ALTER TABLE "raw_material" ADD "marketId" integer`);

        // Add foreign key constraints back
        await queryRunner.query(`ALTER TABLE "machine" ADD CONSTRAINT "FK_machine_market" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicle" ADD CONSTRAINT "FK_vehicle_market" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "raw_material" ADD CONSTRAINT "FK_raw_material_market" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Revert machine table structure
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "productionRate"`);
        await queryRunner.query(`ALTER TABLE "machine" DROP COLUMN "materialRatio"`);
        await queryRunner.query(`ALTER TABLE "machine" ADD "productionRatio" decimal(5,2) NOT NULL`);
    }
} 