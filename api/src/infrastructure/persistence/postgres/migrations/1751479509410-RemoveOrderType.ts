import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrderType1751479509410 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders DROP COLUMN "orderType"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders ADD COLUMN "orderType" VARCHAR(50) NOT NULL DEFAULT 'unknown'`);
    }
} 