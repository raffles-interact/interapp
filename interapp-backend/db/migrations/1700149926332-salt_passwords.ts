import { MigrationInterface, QueryRunner } from 'typeorm';

export class SaltPasswords1700149926332 implements MigrationInterface {
  name = 'SaltPasswords1700149926332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "password_salt" bytea NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_salt"`);
  }
}
