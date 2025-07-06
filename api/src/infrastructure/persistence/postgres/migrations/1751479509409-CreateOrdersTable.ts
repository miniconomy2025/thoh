import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1751479509409 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                "orderType" VARCHAR(50) NOT NULL,
                "itemName" VARCHAR(100) NOT NULL,
                quantity DECIMAL(12,2) NOT NULL,
                "unitPrice" DECIMAL(12,2) NOT NULL,
                "totalPrice" DECIMAL(12,2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'D',
                "orderDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) NOT NULL DEFAULT 'completed'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE orders`);
    }
} 