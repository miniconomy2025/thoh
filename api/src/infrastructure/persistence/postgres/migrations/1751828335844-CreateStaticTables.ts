import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStaticTables1751828335844 implements MigrationInterface {
    name = 'CreateStaticTables1751828335844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "machine_static" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar UNIQUE NOT NULL,
                "description" text,
                "machine_id" integer,
                CONSTRAINT "FK_machine_static_machine" FOREIGN KEY ("machine_id") REFERENCES "machine"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "material_static" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar UNIQUE NOT NULL,
                "description" text,
                "material_id" integer,
                CONSTRAINT "FK_material_static_material" FOREIGN KEY ("material_id") REFERENCES "raw_material"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "vehicle_static" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar UNIQUE NOT NULL,
                "description" text,
                "vehicle_id" integer,
                CONSTRAINT "FK_vehicle_static_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "phone_static" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar UNIQUE NOT NULL,
                "description" text
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "phone_static"`);
        await queryRunner.query(`DROP TABLE "vehicle_static"`);
        await queryRunner.query(`DROP TABLE "material_static"`);
        await queryRunner.query(`DROP TABLE "machine_static"`);
    }
} 