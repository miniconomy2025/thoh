import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBankAccountIdFromPerson1751828335859 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            DROP COLUMN IF EXISTS "bankAccountId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            ADD COLUMN "bankAccountId" varchar
        `);
    }
} 