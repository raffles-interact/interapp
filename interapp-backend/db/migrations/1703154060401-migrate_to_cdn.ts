import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateToCdn1703154060401 implements MigrationInterface {
  name = 'MigrateToCdn1703154060401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "promotional_image"`);
    await queryRunner.query(`ALTER TABLE "service" ADD "promotional_image" character varying`);
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "attachment"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "attachment" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "attachment"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "attachment" bytea`);
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "promotional_image"`);
    await queryRunner.query(`ALTER TABLE "service" ADD "promotional_image" bytea`);
  }
}
