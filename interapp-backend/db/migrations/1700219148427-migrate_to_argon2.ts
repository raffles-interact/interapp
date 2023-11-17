import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateToArgon21700219148427 implements MigrationInterface {
    name = 'MigrateToArgon21700219148427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_salt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" bytea NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password_salt" character varying NOT NULL`);
    }

}
