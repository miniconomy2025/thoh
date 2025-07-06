import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnnecessaryFieldsFromCollection1751479509410 implements MigrationInterface {
    name = 'RemoveUnnecessaryFieldsFromCollection1751479509410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "unitPrice"`);
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "currency"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection" ADD "currency" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "collection" ADD "totalPrice" decimal(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "collection" ADD "unitPrice" decimal(12,2) NOT NULL`);
    }
} 