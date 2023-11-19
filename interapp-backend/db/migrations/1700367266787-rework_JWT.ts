import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReworkJWT1700367266787 implements MigrationInterface {
  name = 'ReworkJWT1700367266787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_a2deb244eda661a007db72f0dbf" UNIQUE ("refresh_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_a2deb244eda661a007db72f0dbf"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
  }
}
