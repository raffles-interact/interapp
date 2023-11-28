import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerification1700274729449 implements MigrationInterface {
  name = 'AddVerification1700274729449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "verified" boolean NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified"`);
  }
}
