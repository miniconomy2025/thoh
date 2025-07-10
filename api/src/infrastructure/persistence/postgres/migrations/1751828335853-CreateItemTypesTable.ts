import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateItemTypesTable1751828335853 implements MigrationInterface {
    name = 'CreateItemTypesTable1751828335853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "item_types" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(50) UNIQUE NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "item_types" ("name") VALUES
                ('raw_material'),
                ('truck'),
                ('machine')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "item_types" CASCADE`);
    }
} 