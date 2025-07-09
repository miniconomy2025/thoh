import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMarketIdToOrders1751828335855 implements MigrationInterface {
    name = 'AddMarketIdToOrders1751828335855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "marketId" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."marketId" IS 'ID of the market where the order was placed'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "marketId"`);
    }
} 