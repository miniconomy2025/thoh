import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRecycleTable1751828335856 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "recycle",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "phoneId",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "brokenAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            })
        );
        await queryRunner.createForeignKey(
            "recycle",
            new TableForeignKey({
                columnNames: ["phoneId"],
                referencedColumnNames: ["id"],
                referencedTableName: "phone",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("recycle");
    }
} 