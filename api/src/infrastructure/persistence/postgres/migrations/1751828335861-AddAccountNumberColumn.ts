import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountNumberColumn1751828335861 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            ADD COLUMN "accountNumber" varchar NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            DROP COLUMN "accountNumber"
        `);
    }
} 