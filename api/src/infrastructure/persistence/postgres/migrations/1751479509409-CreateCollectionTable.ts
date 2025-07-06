import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCollectionTable1751479509409 implements MigrationInterface {
    name = 'CreateCollectionTable1751479509409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "collection" (
                "id" SERIAL NOT NULL,
                "orderId" integer NOT NULL,
                "itemName" character varying NOT NULL,
                "itemId" integer NOT NULL,
                "quantity" decimal(12,2) NOT NULL,
                "unitPrice" decimal(12,2) NOT NULL,
                "totalPrice" decimal(12,2) NOT NULL,
                "currency" character varying NOT NULL,
                "orderDate" TIMESTAMP NOT NULL,
                "collected" boolean NOT NULL DEFAULT false,
                "collectionDate" TIMESTAMP,
                CONSTRAINT "PK_collection_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "collection"`);
    }
} 