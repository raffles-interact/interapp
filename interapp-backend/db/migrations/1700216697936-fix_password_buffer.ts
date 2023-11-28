import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPasswordBuffer1700216697936 implements MigrationInterface {
  name = 'FixPasswordBuffer1700216697936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" bytea NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" character varying NOT NULL`);
  }
}
