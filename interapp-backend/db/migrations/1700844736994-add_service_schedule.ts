import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceSchedule1700844736994 implements MigrationInterface {
  name = 'AddServiceSchedule1700844736994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service" ADD "day_of_week" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "service" ADD "start_time" TIME NOT NULL`);
    await queryRunner.query(`ALTER TABLE "service" ADD "end_time" TIME NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "UQ_7806a14d42c3244064b4a1706ca" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "UQ_7806a14d42c3244064b4a1706ca"`,
    );
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "end_time"`);
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "start_time"`);
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "day_of_week"`);
  }
}
