import { MigrationInterface, QueryRunner } from "typeorm";


export class CreateStatusTable implements MigrationInterface {
    name = 'CreateStatusTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "status" (
            "code" character varying NOT NULL,
            "description" character varying,
            CONSTRAINT "PK_status_code" PRIMARY KEY ("code")
        )`);
        await queryRunner.query(`INSERT INTO "status" ("code", "description") VALUES
            ('not_started', 'Simulation has not started'),
            ('running', 'Simulation is running'),
            ('paused', 'Simulation is paused'),
            ('completed', 'Simulation is completed')
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "status" CASCADE`);
    }
}

export class CreateSimulationTable implements MigrationInterface {
    name = 'CreateSimulationTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "simulation" (
            "id" SERIAL PRIMARY KEY,
            "status" character varying NOT NULL DEFAULT 'not_started',
            "currentDay" integer NOT NULL DEFAULT 0,
            CONSTRAINT "FK_simulation_status" FOREIGN KEY ("status") REFERENCES "status"("code")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "simulation" CASCADE`);
    }
}

export class CreatePhoneTable implements MigrationInterface {
    name = 'CreatePhoneTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "phone" (
            "id" SERIAL PRIMARY KEY,
            "model" character varying NOT NULL,
            "isBroken" boolean NOT NULL DEFAULT false
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "phone" CASCADE`);
    }
}

// Simulation table migration

// Status table migration

// Currency table migration
export class CreateCurrencyTable implements MigrationInterface {
    name = 'CreateCurrencyTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "currency" (
            "code" character varying NOT NULL,
            "description" character varying,
            CONSTRAINT "PK_currency_code" PRIMARY KEY ("code")
        )`);
        await queryRunner.query(`INSERT INTO "currency" ("code", "description") VALUES
            ('D', 'Default currency')
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "currency" CASCADE`);
    }
}


// Market table migration
export class CreateMarketTable implements MigrationInterface {
    name = 'CreateMarketTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "market" (
            "id" SERIAL PRIMARY KEY,
            "simulationId" integer,
            CONSTRAINT "FK_market_simulation" FOREIGN KEY ("simulationId") REFERENCES "simulation"("id")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "market" CASCADE`);
    }
}

// Machine table migration
export class CreateMachineTable implements MigrationInterface {
    name = 'CreateMachineTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "machine" (
            "id" SERIAL PRIMARY KEY,
            "type" character varying NOT NULL,
            "cost" decimal(12,2) NOT NULL,
            "weight" decimal(12,2) NOT NULL,
            "productionRatio" decimal(5,2) NOT NULL,
            "sold" boolean NOT NULL DEFAULT false,
            "marketId" integer,
            CONSTRAINT "FK_machine_market" FOREIGN KEY ("marketId") REFERENCES "market"("id")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "machine" CASCADE`);
    }
}

// Vehicle table migration
export class CreateVehicleTable implements MigrationInterface {
    name = 'CreateVehicleTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vehicle" (
            "id" SERIAL PRIMARY KEY,
            "type" character varying NOT NULL,
            "cost" decimal(12,2) NOT NULL,
            "weight" decimal(12,2) NOT NULL,
            "operatingCostPerDay" integer NOT NULL,
            "sold" boolean NOT NULL DEFAULT false,
            "marketId" integer,
            CONSTRAINT "FK_vehicle_market" FOREIGN KEY ("marketId") REFERENCES "market"("id")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicle" CASCADE`);
    }
}

// RawMaterial table migration
export class CreateRawMaterialTable implements MigrationInterface {
    name = 'CreateRawMaterialTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "raw_material" (
            "id" SERIAL PRIMARY KEY,
            "name" character varying NOT NULL,
            "costPerKg" decimal(10,2) NOT NULL,
            "availableWeight" decimal(12,2) NOT NULL,
            "marketId" integer,
            CONSTRAINT "FK_raw_material_market" FOREIGN KEY ("marketId") REFERENCES "market"("id")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "raw_material" CASCADE`);
    }
}

// Population table migration
export class CreatePopulationTable implements MigrationInterface {
    name = 'CreatePopulationTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "population" (
            "id" SERIAL PRIMARY KEY,
            CONSTRAINT "FK_population_simulation" FOREIGN KEY ("id") REFERENCES "simulation"("id")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "population" CASCADE`);
    }
}

// Person table migration
export class CreatePersonTable implements MigrationInterface {
    name = 'CreatePersonTable1751479509404'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "person" (
            "id" SERIAL PRIMARY KEY,
            "bankAccountId" character varying NOT NULL,
            "salary" decimal(12,2) NOT NULL,
            "currency" character varying NOT NULL DEFAULT 'D',
            "phoneWorking" boolean NOT NULL DEFAULT true,
            "phoneId" integer,
            CONSTRAINT "FK_person_phone" FOREIGN KEY ("phoneId") REFERENCES "phone"("id") ON DELETE SET NULL,
            CONSTRAINT "FK_person_currency" FOREIGN KEY ("currency") REFERENCES "currency"("code")
        )`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "person" CASCADE`);
    }
}

// Phone table migration