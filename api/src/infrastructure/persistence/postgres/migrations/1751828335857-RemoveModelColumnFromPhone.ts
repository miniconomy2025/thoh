import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveModelColumnFromPhone1751828335857 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "phone"
            DROP COLUMN IF EXISTS "model"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "phone"
            ADD COLUMN "model" varchar
        `);
    }
} 