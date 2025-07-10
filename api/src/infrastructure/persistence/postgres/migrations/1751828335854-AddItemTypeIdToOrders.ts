import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItemTypeIdToOrders1751828335854 implements MigrationInterface {
    name = 'AddItemTypeIdToOrders1751828335854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "item_type_id" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_item_type_id" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_item_type_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "item_type_id"`);
    }
} 