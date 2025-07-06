import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItemIdToOrders1751479509409 implements MigrationInterface {
    name = 'AddItemIdToOrders1751479509409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "itemId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "itemId"`);
    }
} 