import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModelIdToPhone1751828335856 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "phone"
            ADD COLUMN "modelId" integer,
            ADD CONSTRAINT "FK_phone_model" FOREIGN KEY ("modelId") REFERENCES "phone_static"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "phone"
            DROP CONSTRAINT "FK_phone_model",
            DROP COLUMN "modelId"
        `);
    }
} 