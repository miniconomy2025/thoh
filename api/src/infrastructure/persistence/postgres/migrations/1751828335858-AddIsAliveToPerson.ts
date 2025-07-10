import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAliveToPerson1751828335858 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            ADD COLUMN "isAlive" boolean DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "person"
            DROP COLUMN "isAlive"
        `);
    }
} 