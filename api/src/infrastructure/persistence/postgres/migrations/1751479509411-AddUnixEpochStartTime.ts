import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnixEpochStartTime1751479509411 implements MigrationInterface {
    name = 'AddUnixEpochStartTime1751479509411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "simulation" ADD COLUMN "unixEpochStartTime" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "simulation" DROP COLUMN "unixEpochStartTime"`);
    }
} 