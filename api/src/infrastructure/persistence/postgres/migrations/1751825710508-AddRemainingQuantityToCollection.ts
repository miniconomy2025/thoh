import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRemainingQuantityToCollection1751825710508 implements MigrationInterface {
    name = 'AddRemainingQuantityToCollection1751825710508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" ADD "remainingQuantity" decimal(12,2) NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "remainingQuantity"`);
    }
} 