import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameRemainingQuantityToAmountCollected1751828335841 implements MigrationInterface {
    name = 'RenameRemainingQuantityToAmountCollected1751828335841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" RENAME COLUMN "remainingQuantity" TO "amountCollected"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" RENAME COLUMN "amountCollected" TO "remainingQuantity"`);
    }
} 