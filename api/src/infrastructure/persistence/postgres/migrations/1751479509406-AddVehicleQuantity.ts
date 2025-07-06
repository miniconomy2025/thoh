import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleQuantity1751479509406 implements MigrationInterface {
    name = 'AddVehicleQuantity1751479509406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle" ADD "quantity" integer NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle" DROP COLUMN "quantity"`);
    }
} 